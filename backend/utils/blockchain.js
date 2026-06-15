import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config({
  path: new URL("../.env", import.meta.url),
});

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

const SEPOLIA_CHAIN_ID = 11155111n;

const TRANSACTION_TIMEOUT_MS = Number(
  process.env.BLOCKCHAIN_TX_TIMEOUT_MS || 180000,
);

const MIN_PRIORITY_FEE_GWEI =
  process.env.BLOCKCHAIN_MIN_PRIORITY_FEE_GWEI || "1.5";

const FALLBACK_MAX_FEE_GWEI =
  process.env.BLOCKCHAIN_FALLBACK_MAX_FEE_GWEI || "30";

const CONTRACT_START_BLOCK = Number(
  process.env.BLOCKCHAIN_CONTRACT_START_BLOCK || 11063746,
);

const LOG_BLOCK_RANGE = Math.min(
  Math.max(Number(process.env.BLOCKCHAIN_LOG_BLOCK_RANGE || 10), 1),
  10,
);

const LOG_SCAN_DELAY_MS = Math.max(
  Number(process.env.BLOCKCHAIN_LOG_SCAN_DELAY_MS || 100),
  0,
);

const LOG_QUERY_RETRY_COUNT = Math.max(
  Number(process.env.BLOCKCHAIN_LOG_QUERY_RETRY_COUNT || 3),
  1,
);

let provider = null;
let wallet = null;
let readContract = null;
let writeContract = null;
let contractValidation = null;

const sleep = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const getErrorMessage = (error) =>
  error?.shortMessage ||
  error?.reason ||
  error?.message ||
  "Lỗi không xác định";

const getProvider = () => {
  if (provider) {
    return provider;
  }

  if (!process.env.ALCHEMY_API_KEY) {
    throw new Error("Thiếu cấu hình ALCHEMY_API_KEY");
  }

  provider = new ethers.JsonRpcProvider(
    `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  );

  return provider;
};

const getWallet = () => {
  if (wallet) {
    return wallet;
  }

  if (!process.env.ADMIN_PRIVATE_KEY) {
    throw new Error("Thiếu cấu hình ADMIN_PRIVATE_KEY để ghi Blockchain");
  }

  wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, getProvider());

  return wallet;
};

const getReadContract = () => {
  if (readContract) {
    return readContract;
  }

  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error("Thiếu cấu hình CONTRACT_ADDRESS");
  }

  readContract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    ABI,
    getProvider(),
  );

  return readContract;
};

const getWriteContract = () => {
  if (writeContract) {
    return writeContract;
  }

  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error("Thiếu cấu hình CONTRACT_ADDRESS");
  }

  writeContract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    ABI,
    getWallet(),
  );

  return writeContract;
};

const validateConfiguredContract = async () => {
  if (contractValidation) {
    return contractValidation;
  }

  contractValidation = (async () => {
    const address = process.env.CONTRACT_ADDRESS;

    if (!address) {
      throw new Error("Thiếu cấu hình CONTRACT_ADDRESS");
    }

    if (!ethers.isAddress(address)) {
      throw new Error("CONTRACT_ADDRESS không đúng định dạng địa chỉ EVM");
    }

    if (!Number.isInteger(CONTRACT_START_BLOCK) || CONTRACT_START_BLOCK < 0) {
      throw new Error(
        "BLOCKCHAIN_CONTRACT_START_BLOCK phải là số block hợp lệ",
      );
    }

    const blockchainProvider = getProvider();
    const network = await blockchainProvider.getNetwork();

    if (network.chainId !== SEPOLIA_CHAIN_ID) {
      throw new Error(
        `Sai mạng Blockchain. Yêu cầu Sepolia ${SEPOLIA_CHAIN_ID.toString()}, hiện tại là ${network.chainId.toString()}`,
      );
    }

    const code = await blockchainProvider.getCode(address);

    if (code === "0x") {
      throw new Error(
        "CONTRACT_ADDRESS không có contract code trên Sepolia. Kiểm tra lại địa chỉ contract và network.",
      );
    }

    try {
      const contract = new ethers.Contract(address, ABI, blockchainProvider);

      await contract.admin();
    } catch {
      throw new Error(
        "CONTRACT_ADDRESS không phải contract CeramicTrace đúng ABI trên Sepolia. Không thực hiện Blockchain để tránh tốn gas.",
      );
    }
  })();

  try {
    await contractValidation;
  } catch (error) {
    contractValidation = null;
    throw error;
  }

  return contractValidation;
};

const getTransactionFees = async () => {
  const blockchainProvider = getProvider();
  const feeData = await blockchainProvider.getFeeData();

  const minimumPriorityFee = ethers.parseUnits(MIN_PRIORITY_FEE_GWEI, "gwei");

  const fallbackMaxFee = ethers.parseUnits(FALLBACK_MAX_FEE_GWEI, "gwei");

  let maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || minimumPriorityFee;

  if (maxPriorityFeePerGas < minimumPriorityFee) {
    maxPriorityFeePerGas = minimumPriorityFee;
  }

  let maxFeePerGas = feeData.maxFeePerGas;

  if (!maxFeePerGas || maxFeePerGas <= maxPriorityFeePerGas) {
    const calculatedMaxFee = feeData.gasPrice
      ? feeData.gasPrice * 2n
      : fallbackMaxFee;

    maxFeePerGas =
      calculatedMaxFee > maxPriorityFeePerGas
        ? calculatedMaxFee
        : maxPriorityFeePerGas * 2n;
  }

  return {
    maxPriorityFeePerGas,
    maxFeePerGas,
  };
};

const queryEventsWithRetry = async (contract, filter, fromBlock, toBlock) => {
  let lastError = null;

  for (let attempt = 1; attempt <= LOG_QUERY_RETRY_COUNT; attempt += 1) {
    try {
      return await contract.queryFilter(filter, fromBlock, toBlock);
    } catch (error) {
      lastError = error;

      if (attempt === LOG_QUERY_RETRY_COUNT) {
        break;
      }

      const retryDelay = attempt * 500;

      console.warn(
        `Không thể đọc log block ${fromBlock}-${toBlock}. Thử lại lần ${attempt + 1}/${LOG_QUERY_RETRY_COUNT} sau ${retryDelay}ms...`,
      );

      await sleep(retryDelay);
    }
  }

  throw lastError;
};

const findProductCreationTxHash = async (contract, maSanPham) => {
  const blockchainProvider = getProvider();
  const latestBlock = await blockchainProvider.getBlockNumber();

  const startBlock = Math.max(CONTRACT_START_BLOCK, 0);

  if (startBlock > latestBlock) {
    throw new Error(
      `BLOCKCHAIN_CONTRACT_START_BLOCK=${startBlock} lớn hơn block hiện tại ${latestBlock}`,
    );
  }

  const filter = contract.filters.SanPhamDaTao();

  console.log(
    `Đang tìm TxHash của sản phẩm ${maSanPham} từ block ${startBlock} đến ${latestBlock}...`,
  );

  let toBlock = latestBlock;
  let scannedBlockCount = 0;

  while (toBlock >= startBlock) {
    const fromBlock = Math.max(startBlock, toBlock - LOG_BLOCK_RANGE + 1);

    const events = await queryEventsWithRetry(
      contract,
      filter,
      fromBlock,
      toBlock,
    );

    const matchedEvent = [...events].reverse().find((event) => {
      const eventProductId = event.args?.maSanPham ?? event.args?.[0];

      return String(eventProductId) === String(maSanPham);
    });

    if (matchedEvent) {
      console.log(
        `Đã tìm thấy TxHash tại block ${matchedEvent.blockNumber}: ${matchedEvent.transactionHash}`,
      );

      return matchedEvent.transactionHash;
    }

    scannedBlockCount += toBlock - fromBlock + 1;

    if (scannedBlockCount % 500 === 0 || fromBlock === startBlock) {
      console.log(
        `Đã quét ${scannedBlockCount} block, chưa tìm thấy sản phẩm ${maSanPham}...`,
      );
    }

    toBlock = fromBlock - 1;

    if (toBlock >= startBlock && LOG_SCAN_DELAY_MS > 0) {
      await sleep(LOG_SCAN_DELAY_MS);
    }
  }

  return null;
};

const normalizeDate = (value) => {
  if (!value) {
    return new Date().toISOString().split("T")[0];
  }

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  const stringValue = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().split("T")[0];
  }

  return date.toISOString().split("T")[0];
};

export const bcThemSanPham = async (product, nhaCungCap = {}) => {
  console.log("A: Kiểm tra contract");

  await validateConfiguredContract();

  const blockchainProvider = getProvider();
  const adminWallet = getWallet();
  const contract = getWriteContract();

  const contractAdmin = await contract.admin();

  if (contractAdmin.toLowerCase() !== adminWallet.address.toLowerCase()) {
    throw new Error(
      `Ví hiện tại ${adminWallet.address} không phải admin của contract. Admin contract là ${contractAdmin}.`,
    );
  }

  const maSanPham = String(product.MaSanPham);

  const tenSanPham = product.TenSanPham || "Chưa cập nhật";

  const tenNhaCungCap = nhaCungCap.TenNhaCC || "Chưa cập nhật";

  const diaChiNhaCungCap = nhaCungCap.Diachi || "Chưa cập nhật";

  const chatLieu = product.ChatLieu || "Gốm sứ";

  const ngaySanXuat = normalizeDate(product.NgaySanXuat);

  console.log("B: Kiểm tra sản phẩm trên Blockchain");

  const existingProduct = await contract.products(maSanPham);

  if (existingProduct.tonTai) {
    let existingTxHash = null;

    try {
      existingTxHash = await findProductCreationTxHash(contract, maSanPham);
    } catch (error) {
      throw new Error(
        `Sản phẩm ${maSanPham} đã tồn tại trên Blockchain nhưng không thể tìm TxHash: ${getErrorMessage(error)}`,
      );
    }

    if (existingTxHash) {
      console.warn(
        `Sản phẩm ${maSanPham} đã tồn tại trên Blockchain. Dùng lại TxHash: ${existingTxHash}`,
      );

      return existingTxHash;
    }

    throw new Error(
      `Sản phẩm ${maSanPham} đã tồn tại trên Blockchain nhưng không tìm được TxHash tạo sản phẩm`,
    );
  }

  console.log("C: Lấy phí giao dịch");

  const { maxPriorityFeePerGas, maxFeePerGas } = await getTransactionFees();

  console.log("Phí Blockchain:", {
    maxPriorityFeePerGas: `${ethers.formatUnits(
      maxPriorityFeePerGas,
      "gwei",
    )} gwei`,
    maxFeePerGas: `${ethers.formatUnits(maxFeePerGas, "gwei")} gwei`,
  });

  console.log("D: Ước tính gas");

  const estimatedGas = await contract.themSanPham.estimateGas(
    maSanPham,
    tenSanPham,
    tenNhaCungCap,
    diaChiNhaCungCap,
    chatLieu,
    ngaySanXuat,
    {
      maxPriorityFeePerGas,
      maxFeePerGas,
    },
  );

  const gasLimit = (estimatedGas * 120n) / 100n;

  console.log("Gas ước tính:", estimatedGas.toString());

  console.log("Gas limit:", gasLimit.toString());

  console.log("E: Gửi transaction");

  const tx = await contract.themSanPham(
    maSanPham,
    tenSanPham,
    tenNhaCungCap,
    diaChiNhaCungCap,
    chatLieu,
    ngaySanXuat,
    {
      gasLimit,
      maxPriorityFeePerGas,
      maxFeePerGas,
    },
  );

  console.log("Transaction đã gửi:", {
    hash: tx.hash,
    nonce: tx.nonce,
    from: tx.from,
    to: tx.to,
  });

  console.log(`Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);

  console.log(
    `F: Đang chờ 1 xác nhận, timeout ${TRANSACTION_TIMEOUT_MS / 1000} giây`,
  );

  try {
    const receipt = await tx.wait(1, TRANSACTION_TIMEOUT_MS);

    if (!receipt) {
      throw new Error("Không nhận được transaction receipt");
    }

    if (receipt.status !== 1) {
      throw new Error(`Transaction thất bại trên Blockchain: ${tx.hash}`);
    }

    console.log("G: Transaction đã xác nhận:", {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status,
    });

    return receipt.hash || tx.hash;
  } catch (error) {
    if (
      error?.code === "TRANSACTION_REPLACED" &&
      !error?.cancelled &&
      error?.receipt?.status === 1
    ) {
      const replacementHash = error.replacement?.hash || error.receipt?.hash;

      console.log(
        `G: Transaction đã được thay thế và xác nhận: ${replacementHash}`,
      );

      return replacementHash;
    }

    console.error(
      "Không nhận được xác nhận trong thời gian chờ. Đang kiểm tra lại transaction...",
    );

    const receipt = await blockchainProvider.getTransactionReceipt(tx.hash);

    if (receipt?.status === 1) {
      console.log("G: Transaction thực tế đã xác nhận:", tx.hash);

      return tx.hash;
    }

    if (receipt?.status === 0) {
      throw new Error(
        `Transaction đã thất bại trên Blockchain. Hash: ${tx.hash}`,
      );
    }

    const pendingTransaction = await blockchainProvider.getTransaction(tx.hash);

    if (pendingTransaction && pendingTransaction.blockNumber === null) {
      const timeoutError = new Error(
        `Transaction vẫn đang pending sau ${TRANSACTION_TIMEOUT_MS / 1000} giây. Không chạy lại ngay để tránh gửi trùng. Hash: ${tx.hash}`,
      );

      timeoutError.code = "BLOCKCHAIN_TX_PENDING";

      timeoutError.transactionHash = tx.hash;

      timeoutError.isPending = true;

      throw timeoutError;
    }

    throw new Error(
      `Không thể xác nhận transaction ${tx.hash}: ${getErrorMessage(error)}`,
    );
  }
};

export const bcXemSanPham = async (maSanPham) => {
  await validateConfiguredContract();

  const contract = getReadContract();

  const data = await contract.xemSanPham(String(maSanPham));

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
      {
        timeZone: "Asia/Ho_Chi_Minh",
      },
    ),
    tonTai: data.tonTai,
  };
};
