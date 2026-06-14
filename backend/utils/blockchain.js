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

let readContract = null;
let writeContract = null;
let contractValidation = null;

const getProvider = () => {
  if (!process.env.ALCHEMY_API_KEY || !process.env.CONTRACT_ADDRESS) {
    throw new Error("Thiếu cấu hình ALCHEMY_API_KEY hoặc CONTRACT_ADDRESS");
  }

  const provider = new ethers.JsonRpcProvider(
    `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  );
  return provider;
};

const getReadContract = () => {
  if (readContract) return readContract;

  readContract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    ABI,
    getProvider(),
  );

  return readContract;
};

const getWriteContract = () => {
  if (writeContract) return writeContract;

  if (!process.env.ADMIN_PRIVATE_KEY) {
    throw new Error("Thiếu cấu hình ADMIN_PRIVATE_KEY để ghi Blockchain");
  }

  const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, getProvider());
  writeContract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    ABI,
    wallet,
  );

  return writeContract;
};

const validateConfiguredContract = async () => {
  if (contractValidation) return contractValidation;

  contractValidation = (async () => {
    const address = process.env.CONTRACT_ADDRESS;

    if (!ethers.isAddress(address)) {
      throw new Error("CONTRACT_ADDRESS không đúng định dạng địa chỉ ví EVM");
    }

    const provider = getProvider();
    const code = await provider.getCode(address);

    if (code === "0x") {
      throw new Error(
        "CONTRACT_ADDRESS không có contract code trên Sepolia. Kiểm tra lại địa chỉ contract/network.",
      );
    }

    try {
      const c = new ethers.Contract(address, ABI, provider);
      await c.admin();
    } catch {
      throw new Error(
        "CONTRACT_ADDRESS không phải contract CeramicTrace đúng ABI trên Sepolia. Không thực hiện ghi/đọc blockchain để tránh tốn gas.",
      );
    }
  })();

  return contractValidation;
};

export const bcThemSanPham = async (product, nhaCungCap = {}) => {
  console.log("A: validate");

  await validateConfiguredContract();

  console.log("B: get contract");

  const c = getWriteContract();

  console.log("C: send tx");
  const tx = await c.themSanPham(
    product.MaSanPham.toString(),
    product.TenSanPham,
    nhaCungCap.TenNhaCC || "Chưa cập nhật",
    nhaCungCap.Diachi || "Chưa cập nhật",
    product.ChatLieu || "Gốm sứ",
    product.NgaySanXuat || new Date().toISOString().split("T")[0],
  );

  const txInfo = await getProvider().getTransaction(tx.hash);

  console.log("TX INFO:", txInfo);
  
  console.log("D: waiting confirm");

  await tx.wait();

  console.log("E: confirmed");

  return tx.hash;
};

export const bcXemSanPham = async (maSanPham) => {
  await validateConfiguredContract();

  const c = getReadContract();
  const data = await c.xemSanPham(String(maSanPham));

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
