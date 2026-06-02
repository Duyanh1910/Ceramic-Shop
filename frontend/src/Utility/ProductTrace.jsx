import { useState, useEffect, useRef } from "react";
import { Modal, Spin, Alert, Tabs } from "antd";
import { SafetyOutlined, QrcodeOutlined, EnvironmentOutlined, CheckCircleFilled } from "@ant-design/icons";
import axios from "axios";
import QRCode from "qrcode";

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";
const FRONTEND_BASE = "https://ceramic-shop.vercel.app";

function QRCanvas({ url, size = 160 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !url) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 2,
      color: { dark: "#173354", light: "#ffffff" },
    });
  }, [url, size]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = `QR-SP${url.split("/").pop()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{
        padding: 10,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(23,51,84,0.10)",
        border: "1px solid #e8e4dc",
      }}>
        <canvas ref={canvasRef} style={{ display: "block", borderRadius: 6 }} />
      </div>
      <button
        onClick={handleDownload}
        style={{
          background: "none",
          border: "1px solid #e8e4dc",
          borderRadius: 20,
          padding: "4px 14px",
          fontSize: 11,
          color: "#6b7280",
          cursor: "pointer",
          transition: "all 0.18s",
          fontFamily: "inherit",
        }}
        onMouseEnter={e => { e.target.style.borderColor = "#1b437c"; e.target.style.color = "#1b437c"; }}
        onMouseLeave={e => { e.target.style.borderColor = "#e8e4dc"; e.target.style.color = "#6b7280"; }}
      >
        Tải xuống
      </button>
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
      <p style={{ marginBottom: 10, fontWeight: 600, fontSize: 13, color: "#3d4451", display: "flex", alignItems: "center", gap: 6 }}>
        <EnvironmentOutlined style={{ color: "#e74c3c" }} />
        {diaChi}
      </p>
      <iframe
        title="Vị trí nhà cung cấp"
        src={src}
        width="100%"
        height="280"
        style={{ border: 0, borderRadius: 10, display: "block" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <p style={{ marginTop: 8, fontSize: 11, color: "#aaa", fontStyle: "italic" }}>
        Vị trí hiển thị dựa trên địa chỉ được ghi trên blockchain, không phải GPS thực tế.
      </p>
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 3,
      padding: "10px 0",
      borderBottom: "1px solid #f0ede8",
    }}>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: "#bbb" }}>
        {label}
      </span>
      <span style={{
        fontSize: mono ? 11 : 14,
        color: mono ? "#999" : "#1a1a2e",
        fontFamily: mono ? "monospace" : "inherit",
        fontWeight: mono ? 400 : 500,
        wordBreak: "break-all",
        lineHeight: 1.5,
      }}>
        {value || "—"}
      </span>
    </div>
  );
}

export default function ProductTrace({ maSanPham, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [activeTab, setActiveTab] = useState("info");

  const traceUrl = `${FRONTEND_BASE}/products/${maSanPham}?trace=true`;

  const fetchTrace = async () => {
    if (!maSanPham || disabled) return;
    setOpen(true);
    setStatus("loading");
    setActiveTab("info");

    try {
      const res = await axios.get(`${API_BASE}/products/${maSanPham}/trace`);
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
        msg.toLowerCase().includes("khong ton tai") || msg.toLowerCase().includes("không tồn tại")
          ? "not_found" : "error"
      );
    }
  };

  const InfoPanel = () => (
    <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 18,
          padding: "9px 14px",
          background: "linear-gradient(90deg, rgba(27,67,124,0.07), rgba(27,67,124,0.02))",
          borderRadius: 8,
          borderLeft: "3px solid #bb9244",
        }}>
          <CheckCircleFilled style={{ color: "#52c41a", fontSize: 14 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#1b437c", letterSpacing: "0.3px" }}>
            Đã xác thực trên Ethereum Sepolia
          </span>
        </div>

        <InfoRow label="Tên sản phẩm" value={data?.tenSanPham} />
        <InfoRow label="Nhà cung cấp" value={data?.tenNhaCungCap} />
        <InfoRow label="Chất liệu" value={data?.chatLieu} />
        <InfoRow label="Ngày sản xuất" value={data?.ngaySanXuat} />
        <InfoRow label="Thời gian ghi lên blockchain" value={data?.thoiGianTao} />
        <div style={{ paddingTop: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: "#bbb" }}>
            Địa chỉ ví
          </span>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#999", fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.6 }}>
            {data?.nguoiTao}
          </p>
        </div>
      </div>

      <div style={{ flexShrink: 0, paddingTop: 2 }}>
        <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: "#bbb", textAlign: "center" }}>
          Mã QR nguồn gốc
        </p>
        <QRCanvas url={traceUrl} size={148} />
      </div>
    </div>
  );

  const tabItems = [
    {
      key: "info",
      label: <span style={{ fontSize: 13 }}>Thông tin nguồn gốc</span>,
      children: <InfoPanel />,
    },
    {
      key: "map",
      label: (
        <span style={{ fontSize: 13 }}>
          <EnvironmentOutlined style={{ marginRight: 5 }} />Vị trí NCC
        </span>
      ),
      children: <SupplierMap diaChi={data?.diaChiNhaCungCap} />,
    },
    {
      key: "qr",
      label: (
        <span style={{ fontSize: 13 }}>
          <QrcodeOutlined style={{ marginRight: 5 }} />Mã QR lớn
        </span>
      ),
      children: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0" }}>
          <p style={{ marginBottom: 20, color: "#6b7280", fontSize: 13, textAlign: "center" }}>
            Khách hàng quét mã này để xem nguồn gốc sản phẩm
          </p>
          <QRCanvas url={traceUrl} size={240} />
          <p style={{ marginTop: 14, fontSize: 11, color: "#aaa", wordBreak: "break-all", textAlign: "center", maxWidth: 320 }}>
            {traceUrl}
          </p>
        </div>
      ),
    },
  ];

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: "#aaa", fontSize: 13 }}>Đang truy vấn blockchain...</p>
          </div>
        );
      case "found":
        return <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />;
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
      <button
        onClick={fetchTrace}
        disabled={disabled}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 22px",
          background: disabled ? "#e8e8e8" : "linear-gradient(135deg, #173354 0%, #1b437c 100%)",
          color: disabled ? "#bbb" : "#fff",
          border: "none",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          boxShadow: disabled ? "none" : "0 4px 18px rgba(23,51,84,0.22)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          letterSpacing: "0.3px",
        }}
        onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(23,51,84,0.28)"; }}}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = disabled ? "none" : "0 4px 18px rgba(23,51,84,0.22)"; }}
      >
        <SafetyOutlined style={{ fontSize: 16 }} />
        Xem nguồn gốc sản phẩm
      </button>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: "linear-gradient(135deg, #173354, #1b437c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <SafetyOutlined style={{ color: "#f0d58d", fontSize: 17 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#173354", lineHeight: 1.25 }}>
                Truy xuất nguồn gốc sản phẩm
              </div>
              <div style={{ fontSize: 11, color: "#aaa", fontWeight: 400, marginTop: 1 }}>
                Xác thực trên Blockchain · Ethereum Sepolia
              </div>
            </div>
          </div>
        }
        footer={null}
        width={680}
        destroyOnClose
        styles={{
          header: { borderBottom: "1px solid #f0ede8", paddingBottom: 16, marginBottom: 0 },
          body: { padding: "20px 24px 28px" },
        }}
      >
        {renderContent()}
      </Modal>
    </>
  );
}
