import { useState, useEffect, useRef } from "react";
import { Modal, Spin, Alert } from "antd";
import { 
  EnvironmentOutlined, 
  ArrowRightOutlined,
  CodeSandboxOutlined,
  BlockOutlined,
  FieldTimeOutlined
} from "@ant-design/icons";
import axios from "axios";
import QRCode from "qrcode";

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";
const FRONTEND_BASE = "https://ceramic-shop-rho.vercel.app";

// ==========================================
// 1. COMPONENT TẠO MÃ QR
// ==========================================
function QRCanvas({ url, size = 120, light = "#ffffff" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !url) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 1,
      color: { dark: "#173354", light: light },
    });
  }, [url, size, light]);

  return <canvas ref={canvasRef} style={{ display: "block", borderRadius: 8 }} />;
}

// ==========================================
// 2. COMPONENT BẢN ĐỒ
// ==========================================
function SupplierMap({ diaChi }) {
  if (!diaChi || diaChi === "Chưa cập nhật") {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "#bbb", display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
        <EnvironmentOutlined style={{ fontSize: 24, marginBottom: 8 }} />
        <p>Chưa có tọa độ vị trí</p>
      </div>
    );
  }

  const encoded = encodeURIComponent(diaChi);
  const src = `https://maps.google.com/maps?q=${encoded}&hl=vi&z=15&output=embed`;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <iframe
        title="Vị trí nhà cung cấp"
        src={src}
        width="100%"
        height="320"
        style={{ border: 0, borderRadius: 8, flexGrow: 1, filter: "contrast(1.1)" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

// ==========================================
// 3. COMPONENT CHÍNH
// ==========================================
export default function ProductTrace({ maSanPham, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");

  const webTraceUrl = `${FRONTEND_BASE}/trace/${maSanPham}`;

  const fetchTrace = async () => {
    if (!maSanPham || disabled) return;
    setOpen(true);
    setStatus("loading");

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
      setStatus("error");
    }
  };

  const TriggerCard = () => (
    <div style={{
      background: "#173354",
      borderRadius: 16,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 20,
      maxWidth: 480,
      boxShadow: "0 10px 30px rgba(23,51,84,0.15)",
      border: "1px solid #1b437c"
    }}>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ background: "#fff", padding: 8, borderRadius: 12 }}>
          <QRCanvas url={webTraceUrl} size={110} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#f0d58d", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>
            GENUINE PRODUCT
          </div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            {maSanPham}
          </div>
          <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>
            Mã QR chứa chữ ký số định danh sản phẩm trên mạng lưới Blockchain.
          </div>
        </div>
      </div>
      <button
        onClick={fetchTrace}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "14px 0",
          background: disabled ? "#475569" : "#f0d58d",
          color: disabled ? "#94a3b8" : "#173354",
          border: "none",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          transition: "all 0.2s"
        }}
        onMouseEnter={e => { if(!disabled) e.currentTarget.style.filter = "brightness(1.1)" }}
        onMouseLeave={e => { if(!disabled) e.currentTarget.style.filter = "none" }}
      >
        XEM CHI TIẾT NGUỒN GỐC <ArrowRightOutlined />
      </button>
    </div>
  );

  const renderDashboard = () => {
    if (status === "loading") return <div style={{ padding: 100, textAlign: "center" }}><Spin size="large" /></div>;
    if (status === "not_found") return <Alert type="warning" message="Chưa có dữ liệu Blockchain" />;
    if (status === "error") return <Alert type="error" message="Lỗi kết nối Blockchain" />;

    return (
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1.5fr", // Chuyển thành 2 cột: Cột 1 chiếm 1 phần, Cột 2 chiếm 1.5 phần
        gap: 20, 
        minHeight: 440 
      }}>
        
        {/* CỘT 1: THÔNG TIN SẢN PHẨM */}
        <div style={{ background: "#0d1b2a", borderRadius: 12, padding: 20, border: "1px solid #1b437c", display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#f0d58d", fontSize: 13, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <BlockOutlined /> Thông tin sản phẩm
          </div>
          
          <div style={{ 
            background: "linear-gradient(135deg, #173354, #1b437c)", 
            height: 160, borderRadius: 8, marginBottom: 20, 
            display: "flex", alignItems: "center", justifyContent: "center" 
          }}>
            <CodeSandboxOutlined style={{ fontSize: 48, color: "#f0d58d", opacity: 0.5 }} />
          </div>

          <h3 style={{ color: "#fff", fontSize: 16, margin: "0 0 8px", lineHeight: 1.4, textTransform: "uppercase" }}>
            {data?.tenSanPham}
          </h3>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 16px" }}>{data?.tenNhaCungCap}</p>
          
          {/* Bổ sung thông tin thời gian vào cột 1 để không bị mất dữ liệu */}
          <div style={{ background: "#173354", padding: 12, borderRadius: 8, marginBottom: 20, border: "1px solid #1b437c" }}>
             <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 12, marginBottom: 6 }}>
                <FieldTimeOutlined /> Ngày sản xuất: <span style={{ color: "#fff" }}>{data?.ngaySanXuat}</span>
             </div>
             <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 12 }}>
                <FieldTimeOutlined /> Ghi on-chain: <span style={{ color: "#f0d58d" }}>{data?.thoiGianTao}</span>
             </div>
          </div>

          <div style={{ marginTop: "auto" }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6 }}>MÃ SERIAL (ĐỊNH DANH)</div>
            <div style={{ background: "#173354", padding: "10px 16px", borderRadius: 8, color: "#f0d58d", fontWeight: 600, fontSize: 14, textAlign: "center", marginBottom: 16, border: "1px solid #1b437c" }}>
              {maSanPham}
            </div>
            
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6 }}>TRẠNG THÁI HIỆN TẠI</div>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", padding: "10px 16px", borderRadius: 50, color: "#10b981", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, background: "#10b981", borderRadius: "50%", boxShadow: "0 0 8px #10b981" }} />
              Xuất xưởng / Lên chuỗi
            </div>
          </div>
        </div>

        {/* CỘT 2: BẢN ĐỒ VỊ TRÍ */}
        <div style={{ background: "#0d1b2a", borderRadius: 12, padding: 20, border: "1px solid #1b437c", display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#f0d58d", fontSize: 13, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><EnvironmentOutlined /> Bản Đồ Vị Trí</span>
            <span style={{ background: "rgba(240, 213, 141, 0.15)", color: "#f0d58d", padding: "4px 10px", borderRadius: 20, fontSize: 10 }}>📍 Điểm xuất phát</span>
          </div>
          <div style={{ flexGrow: 1, borderRadius: 8, overflow: "hidden" }}>
             <SupplierMap diaChi={data?.diaChiNhaCungCap} />
          </div>
          <p style={{ marginTop: 12, fontSize: 11, color: "#64748b", fontStyle: "italic", textAlign: "center", margin: "12px 0 0" }}>
            Vị trí hiển thị dựa trên địa chỉ được ghi trên blockchain.
          </p>
        </div>

      </div>
    );
  };

  return (
    <>
      <TriggerCard />

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={800} /* Đã thu nhỏ Modal lại cho vừa cấu trúc 2 cột */
        destroyOnClose
        closeIcon={<div style={{ color: "#f0d58d", fontSize: 18, marginTop: 10 }}>✕</div>}
        styles={{
          content: { 
            background: "#173354",
            padding: "32px 24px",
            border: "1px solid #f0d58d"
          }
        }}
      >
        {renderDashboard()}
      </Modal>
    </>
  );
}