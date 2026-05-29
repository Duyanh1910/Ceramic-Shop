import { ProductModel } from "./models/index.js";
import SupplierModel from "./models/supply/supplier.model.js";
import { bcThemSanPham } from "./utils/blockchain.js";
import { Op } from "sequelize";

const syncOldProductsToBlockchain = async () => {
    console.log("Bắt đầu đồng bộ sản phẩm cũ lên Blockchain...");
    
    const products = await ProductModel.findAll({
        where: { 
            BlockchainTxHash: null,
            MaNhaCC: { [Op.not]: null } 
        }
    });

    if (products.length === 0) {
        console.log("Không tìm thấy sản phẩm cũ nào cần đồng bộ (hoặc bạn chưa cập nhật MaNhaCC cho chúng).");
        process.exit(0);
    }

    for (let p of products) {
        console.log(`Đang đẩy SP [${p.TenSanPham}] lên mạng Blockchain...`);
        try {
            const ncc = await SupplierModel.findByPk(p.MaNhaCC);
            
            const txHash = await bcThemSanPham(p, ncc);
            
            p.BlockchainTxHash = txHash;
            await p.save();
            
            console.log(`Thành công! Mã giao dịch: ${txHash}`);
        } catch (error) {
            console.error(`Thất bại với SP ${p.MaSanPham}:`, error.message);
        }
    }
    console.log("Hoàn thành đồng bộ toàn bộ dữ liệu!");
    process.exit(0);
};

syncOldProductsToBlockchain();
