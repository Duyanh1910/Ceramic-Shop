import { col, fn, Op, where as sequelizeWhere } from "sequelize";
import { ProductModel, sequelize } from "./models/index.js";
import SupplierModel from "./models/supply/supplier.model.js";
import { bcThemSanPham } from "./utils/blockchain.js";

const DEFAULT_SUPPLIER_ID = Number(process.env.DEFAULT_SUPPLIER_ID || 6);
const isDryRun = process.argv.includes("--dry-run");
const supplierCache = new Map();

const SUPPLIER_RULES = [
  { id: 1, keywords: ["minh long"] },
  { id: 2, keywords: ["bát tràng", "bat trang"] },
  { id: 3, keywords: ["healthy cook", "healthycook", "healthy"] },
  { id: 4, keywords: ["chu đậu", "chu dau"] },
  { id: 5, keywords: ["hải long", "hai long"] },
  { id: 7, keywords: ["thanh hà", "thanh ha"] },
  { id: 8, keywords: ["bầu trúc", "bau truc"] },
  { id: 9, keywords: ["donghwa"] },
  { id: 10, keywords: ["phùng gia", "phung gia"] },
];

const missingBlockchainHashWhere = {
  [Op.or]: [
    { BlockchainTxHash: { [Op.is]: null } },
    sequelizeWhere(fn("TRIM", col("BlockchainTxHash")), ""),
  ],
};

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const inferSupplierId = (product) => {
  const searchableText = normalizeText(
    [product.ThuongHieu, product.TenSanPham, product.MoTa]
      .filter(Boolean)
      .join(" "),
  );

  const matchedRule = SUPPLIER_RULES.find((rule) =>
    rule.keywords.some((keyword) =>
      searchableText.includes(normalizeText(keyword)),
    ),
  );

  return matchedRule?.id || DEFAULT_SUPPLIER_ID;
};

const getSupplier = async (supplierId) => {
  if (supplierCache.has(supplierId)) {
    return supplierCache.get(supplierId);
  }

  const supplier = await SupplierModel.findByPk(supplierId);

  if (!supplier) {
    throw new Error(`Không tìm thấy nhà cung cấp MaNhaCC=${supplierId}`);
  }

  supplierCache.set(supplierId, supplier);

  return supplier;
};

const formatError = (error) =>
  error?.message ||
  error?.parent?.message ||
  error?.original?.message ||
  String(error);

const syncOldProductsToBlockchain = async () => {
  console.log(
    "Bắt đầu đồng bộ sản phẩm chưa có BlockchainTxHash lên Blockchain...",
  );

  const products = await ProductModel.findAll({
    where: missingBlockchainHashWhere,
    order: [["MaSanPham", "ASC"]],
  });

  if (products.length === 0) {
    console.log("Không tìm thấy sản phẩm nào cần đồng bộ.");

    return {
      success: 0,
      pending: 0,
      failed: 0,
      skipped: 0,
    };
  }

  console.log(`Tìm thấy ${products.length} sản phẩm cần xử lý.`);

  const result = {
    success: 0,
    pending: 0,
    failed: 0,
    skipped: 0,
  };

  for (const product of products) {
    try {
      const supplierId = product.MaNhaCC || inferSupplierId(product);

      const supplier = await getSupplier(supplierId);
      const wasMissingSupplier = !product.MaNhaCC;

      console.log(
        `[${product.MaSanPham}] ${product.TenSanPham} -> ${supplier.TenNhaCC}`,
      );

      if (isDryRun) {
        result.skipped += 1;
        continue;
      }

      if (wasMissingSupplier) {
        product.MaNhaCC = supplier.MaNhaCC;
        await product.save();
      }

      const txHash = await bcThemSanPham(product, supplier);

      product.BlockchainTxHash = txHash;
      await product.save();

      result.success += 1;

      console.log(`  Thành công. TxHash: ${txHash}`);
    } catch (error) {
      if (error?.isPending && error?.transactionHash) {
        product.BlockchainTxHash = error.transactionHash;

        await product.save();

        result.pending += 1;

        console.warn(
          `  Transaction đang pending nhưng đã lưu TxHash để tránh gửi trùng: ${error.transactionHash}`,
        );

        continue;
      }

      result.failed += 1;

      console.error(
        `  Thất bại với SP ${product.MaSanPham}: ${formatError(error)}`,
      );
    }
  }

  return result;
};

try {
  const result = await syncOldProductsToBlockchain();

  console.log(
    isDryRun
      ? "Hoàn thành kiểm tra dry-run, chưa ghi DB hoặc Blockchain."
      : "Hoàn thành đồng bộ dữ liệu lên Blockchain.",
  );

  console.log(
    `Kết quả: ${result.success} thành công, ${result.pending} đang pending, ${result.failed} thất bại, ${result.skipped} bỏ qua.`,
  );

  process.exitCode = result.failed > 0 ? 1 : 0;
} catch (error) {
  console.error(`Lỗi seed blockchain: ${formatError(error)}`);

  process.exitCode = 1;
} finally {
  await sequelize.close();
}
