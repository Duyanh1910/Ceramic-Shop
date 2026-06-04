import { ProductModel } from "./models/index.js";
import SupplierModel from "./models/supply/supplier.model.js";
import { bcThemSanPham } from "./utils/blockchain.js";

const DEFAULT_SUPPLIER_ID = Number(process.env.DEFAULT_SUPPLIER_ID || 6);
const isDryRun = process.argv.includes("--dry-run");

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

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const inferSupplierId = (product) => {
  const searchableText = normalizeText(
    [
      product.ThuongHieu,
      product.TenSanPham,
      product.MoTa,
    ]
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
  const supplier = await SupplierModel.findByPk(supplierId);

  if (!supplier) {
    throw new Error(`Không tìm thấy nhà cung cấp MaNhaCC=${supplierId}`);
  }

  return supplier;
};

const syncOldProductsToBlockchain = async () => {
  console.log("Bắt đầu đồng bộ sản phẩm chưa có BlockchainTxHash...");

  const products = await ProductModel.findAll({
    where: {
      BlockchainTxHash: null,
    },
    order: [["MaSanPham", "ASC"]],
  });

  if (products.length === 0) {
    console.log("Không tìm thấy sản phẩm nào cần đồng bộ.");
    process.exit(0);
  }

  console.log(`Tìm thấy ${products.length} sản phẩm cần xử lý.`);

  for (const product of products) {
    try {
      const supplierId = product.MaNhaCC || inferSupplierId(product);
      const supplier = await getSupplier(supplierId);
      const wasMissingSupplier = !product.MaNhaCC;

      console.log(
        `[${product.MaSanPham}] ${product.TenSanPham} -> ${supplier.TenNhaCC}`,
      );

      if (isDryRun) {
        continue;
      }

      if (wasMissingSupplier) {
        product.MaNhaCC = supplier.MaNhaCC;
        await product.save();
      }

      const txHash = await bcThemSanPham(product, supplier);

      product.BlockchainTxHash = txHash;
      await product.save();

      console.log(`  Thành công. TxHash: ${txHash}`);
    } catch (error) {
      console.error(
        `  Thất bại với SP ${product.MaSanPham}: ${error.message}`,
      );
    }
  }

  console.log(
    isDryRun
      ? "Hoàn thành kiểm tra dry-run, chưa ghi DB hoặc Blockchain."
      : "Hoàn thành đồng bộ dữ liệu lên Blockchain.",
  );
  process.exit(0);
};

syncOldProductsToBlockchain();
