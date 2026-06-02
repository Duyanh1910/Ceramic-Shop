import { useState, useEffect, useRef } from "react";
import { Button, Modal, Spin, Tabs, Tag, Alert } from "antd";
import { SafetyOutlined, QrcodeOutlined, EnvironmentOutlined } from "@ant-design/icons";
import axios from "axios";
import QRCode from "qrcode";

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";
const FRONTEND_BASE = "https://ceramic-shop.vercel.app";

function QRCanvas({ url }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !url) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 220,
      margin: 2,
      color: { dark: "#1b437c", light: "#ffffff" },
    });
  }, [url]);

  return (
    <div style={{ textAlign: "center" }}>
      <canvas ref={canvasRef} style={{ borderRadius: 12, boxShadow: "0 2px 12px #0001" }} />
      <p style={{ marginTop: 10, fontSize: 12, color: "#888", wordBreak: "break-all" }}>
        {url}
      </p>
      <Button
        size="small"
        onClick={() => {
          const link = document.createElement("a");
          link.download = `QR-SP${url.split("/").pop()}.png`;
          link.href = canvasRef.current.toDataURL();
          link.click();
        }}
      >
        Tải QR xuống
      </Button>
    </div>
  );
}

function SupplierMap({ diaChi }) {
  if (!diaChi || diaChi === "Chưa cập nhật") {
    return (
      <Alert
        type="warning"
        showIcon
        message="Chưa có địa chỉ nhà cung cấp"
        description="Sản phẩm này chưa được gắn địa chỉ nhà cung cấp trên blockchain."
      />
    );
  }

  const encoded = encodeURIComponent(diaChi);
  const src = `https://maps.google.com/maps?q=${encoded}&output=embed&z=15`;

  return (
    <div>
      <p style={{ marginBottom: 8, fontWeight: 600 }}>
        <EnvironmentOutlined style={{ color: "#e74c3c", marginRight: 6 }} />
        {diaChi}
      </p>
      <iframe
        title="Vị trí nhà cung cấp"
        src={src}
        width="100%"
        height="300"
        style={{ border: 0, borderRadius: 10, display: "block" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
        * Vị trí hiển thị dựa trên địa chỉ được ghi trên blockchain, không phải GPS thực tế.
      </p>
    </div>
  );
}

export default function ProductTrace({ maSanPham, disabled = false }) {
  const [open, setOpen]       = useState(false);
  const [data, setData]       = useState(null);
  const [status, setStatus]   = useState("idle"); // idle | loading | found | not_found | error
  const [activeTab, setActiveTab] = useState("info");

  const traceUrl = `${FRONTEND_BASE}/products/${maSanPham}?trace=true`;

  const fetchTrace = async () => {
    if (!maSanPham || disabled) return;
    setOpen(true);
    setStatus("loading");
    setActiveTab("info");

    try {
      const res = await axios.get(`${API_BASE}/products/${maSanPham}/blockchain`);
      const result = res.data?.result;

      if (result?.tonTai) {
        setData(result);
        setStatus("found");
      } else {
        setStatus("not_found");
      }
    } catch (e) {
      const msg = e?.response?.data?.message || "";
      setStatus(
        msg.toLowerCase().includes("khong ton tai") ||
        msg.toLowerCase().includes("không tồn tại")
          ? "not_found"
          : "error"
      );
    }
  };

  const tabItems = [
    {
      key: "info",
      label: "Thông tin nguồn gốc",
      children: (
        <div style={{ fontSize: 14, lineHeight: 2 }}>
          <p><b>Tên sản phẩm:</b> {data?.tenSanPham}</p>
          <p><b>Nhà cung cấp:</b> {data?.tenNhaCungCap}</p>
          <p><b>Chất liệu:</b> {data?.chatLieu}</p>
          <p><b>Ngày sản xuất:</b> {data?.ngaySanXuat}</p>
          <hr style={{ margin: "12px 0", borderColor: "#f0f0f0" }} />
          <p style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
            <b>Địa chỉ ví:</b> {data?.nguoiTao}
          </p>
          <p style={{ fontSize: 12, color: "#999", margin: 0 }}>
            <b>Thời gian ghi:</b> {data?.thoiGianTao}
          </p>
          <div style={{ marginTop: 12 }}>
            <Tag color="green">✓ Đã xác thực trên Ethereum Sepolia</Tag>
          </div>
        </div>
      ),
    },
    {
      key: "map",
      label: (
        <span>
          <EnvironmentOutlined /> Vị trí NCC
        </span>
      ),
      children: <SupplierMap diaChi={data?.diaChiNhaCungCap} />,
    },
    {
      key: "qr",
      label: (
        <span>
          <QrcodeOutlined /> Mã QR
        </span>
      ),
      children: (
        <div>
          <p style={{ marginBottom: 16, color: "#555" }}>
            Khách hàng quét mã QR này để xem nguồn gốc sản phẩm.
          </p>
          <QRCanvas url={traceUrl} />
        </div>
      ),
    },
  ];

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div style={{ textAlign: "center", padding: 48 }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: "#888" }}>Đang truy vấn blockchain...</p>
          </div>
        );

      case "found":
        return (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        );

      case "not_found":
        return (
          <Alert
            type="warning"
            showIcon
            message="Chưa có dữ liệu trên blockchain"
            description="Sản phẩm này chưa được đăng ký trên Ethereum. Vui lòng liên hệ cửa hàng để biết thêm thông tin."
          />
        );

      case "error":
        return (
          <Alert
            type="error"
            showIcon
            message="Không thể kết nối blockchain"
            description="Đã xảy ra lỗi khi truy vấn. Vui lòng thử lại sau."
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Button
        icon={<SafetyOutlined />}
        onClick={fetchTrace}
        disabled={disabled}
        style={{
          background: disabled ? "#ccc" : "#1b437c",
          color: "#fff",
          borderRadius: 8,
          border: "none",
        }}
      >
        Xem nguồn gốc sản phẩm
      </Button>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title={
          <span>
            🔗 Truy xuất nguồn gốc — Blockchain
          </span>
        }
        footer={null}
        width={600}
        destroyOnClose
      >
        {renderContent()}
      </Modal>
    </>
  );
}
