import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_adminMoi",
        type: "address",
      },
    ],
    name: "doiAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_maSanPham",
        type: "string",
      },
      {
        internalType: "string",
        name: "_tenSanPham",
        type: "string",
      },
      {
        internalType: "string",
        name: "_tenNhaCungCap",
        type: "string",
      },
      {
        internalType: "string",
        name: "_diaChiNhaCungCap",
        type: "string",
      },
      {
        internalType: "string",
        name: "_chatLieu",
        type: "string",
      },
      {
        internalType: "string",
        name: "_ngaySanXuat",
        type: "string",
      },
    ],
    name: "themSanPham",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "maSanPham",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "tenSanPham",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "thoiGian",
        type: "uint256",
      },
    ],
    name: "SanPhamDaTao",
    type: "event",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "allProductIds",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "products",
    outputs: [
      {
        internalType: "string",
        name: "maSanPham",
        type: "string",
      },
      {
        internalType: "string",
        name: "tenSanPham",
        type: "string",
      },
      {
        internalType: "string",
        name: "tenNhaCungCap",
        type: "string",
      },
      {
        internalType: "string",
        name: "diaChiNhaCungCap",
        type: "string",
      },
      {
        internalType: "string",
        name: "chatLieu",
        type: "string",
      },
      {
        internalType: "string",
        name: "ngaySanXuat",
        type: "string",
      },
      {
        internalType: "address",
        name: "nguoiTao",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "thoiGianTao",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "tonTai",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_maSanPham",
        type: "string",
      },
    ],
    name: "xemSanPham",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "maSanPham",
            type: "string",
          },
          {
            internalType: "string",
            name: "tenSanPham",
            type: "string",
          },
          {
            internalType: "string",
            name: "tenNhaCungCap",
            type: "string",
          },
          {
            internalType: "string",
            name: "diaChiNhaCungCap",
            type: "string",
          },
          {
            internalType: "string",
            name: "chatLieu",
            type: "string",
          },
          {
            internalType: "string",
            name: "ngaySanXuat",
            type: "string",
          },
          {
            internalType: "address",
            name: "nguoiTao",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "thoiGianTao",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "tonTai",
            type: "bool",
          },
        ],
        internalType: "struct CeramicTrace.Product",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

let contract = null;

// 2. Khởi tạo cầu nối với Blockchain qua Ethers.js
const getContract = () => {
  if (contract) return contract;

  // Đảm bảo bạn đã cấu hình đúng ALCHEMY_API_KEY, ADMIN_PRIVATE_KEY, CONTRACT_ADDRESS trong file .env
  const provider = new ethers.JsonRpcProvider(
    `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  );
  const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
  contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);

  return contract;
};

// ── Ghi thông tin sản phẩm và nhà cung cấp lên blockchain ──
export const bcThemSanPham = async (product, nhaCungCap = {}) => {
  const c = getContract();

  const tx = await c.themSanPham(
    product.MaSanPham.toString(),
    product.TenSanPham,
    nhaCungCap.TenNhaCC || "Chưa cập nhật", // Truyền Tên NCC
    nhaCungCap.Diachi || "Chưa cập nhật", // Truyền Địa chỉ NCC
    product.ChatLieu || "Gốm sứ",
    product.NgaySanXuat || new Date().toISOString().split("T")[0],
  );

  await tx.wait(); // Chờ block được xác nhận trên mạng
  return tx.hash; // Trả về transaction hash để lưu vào DB nếu cần
};

// ── Đọc thông tin sản phẩm (Không tốn phí gas) ──
export const bcXemSanPham = async (maSanPham) => {
  const c = getContract();
  const data = await c.xemSanPham(maSanPham);

  return {
    maSanPham: data.maSanPham,
    tenSanPham: data.tenSanPham,
    tenNhaCungCap: data.tenNhaCungCap,
    diaChiNhaCungCap: data.diaChiNhaCungCap,
    chatLieu: data.chatLieu,
    ngaySanXuat: data.ngaySanXuat,
    nguoiTao: data.nguoiTao,
    thoiGianTao: new Date(Number(data.thoiGianTao) * 1000).toLocaleString(
      "vi-VN",
    ),
    tonTai: data.tonTai,
  };
};
