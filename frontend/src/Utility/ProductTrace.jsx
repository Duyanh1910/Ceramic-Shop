import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal, Spin, Alert, Button } from "antd";
import {
  EnvironmentOutlined,
  ArrowRightOutlined,
  CodeSandboxOutlined,
  BlockOutlined,
  FieldTimeOutlined,
  ScanOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import QRCode from "qrcode";

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";
const FRONTEND_BASE = "https://ceramic-shop-rho.vercel.app";

// ==============================
// QR CANVAS
// ==============================
function QRCanvas({ url, size = 220, light = "#ffffff" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !url) return;

    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 1,
      color: { dark: "#173354", light },
    });
  }, [url, size, light]);

  return <canvas ref={canvasRef} style={{ display: "block", borderRadius: 16 }} />;
}

// ==============================
// MAP
// ==============================
function SupplierMap({ diaChi }) {
  if (!diaChi || diaChi === "Chưa cập nhật") {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          color: "#94a3b8",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          minHeight: 320,
          background: "linear-gradient(180deg, rgba(23,51,84,0.15), rgba(13,27,42,0.55))",
          borderRadius: 16,
          border: "1px dashed rgba(240,213,141,0.25)",
        }}
      >
        <EnvironmentOutlined style={{ fontSize: 28, marginBottom: 10, color: "#f0d58d" }} />
        <p style={{ margin: 0 }}>Chưa có tọa độ vị trí</p>
      </div>
    );
  }

  const encoded = encodeURIComponent(diaChi);
  const src = `https://maps.google.com/maps?q=${encoded}&hl=vi&z=15&output=embed`;

  return (
    <iframe
      title="Vị trí nhà cung cấp"
      src={src}
      width="100%"
      height="100%"
      style={{
        border: 0,
        borderRadius: 16,
        minHeight: 320,
        filter: "contrast(1.06) saturate(1.05)",
      }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

// ==============================
// UI HELPERS
// ==============================
function InfoRow({ icon, label, value, valueColor = "#fff" }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        padding: "12px 14px",
        borderRadius: 14,
        background: "rgba(23,51,84,0.78)",
        border: "1px solid rgba(27,67,124,0.9)",
      }}
    >
      <div style={{ color: "#f0d58d", marginTop: 2 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
        <div style={{ color: valueColor, fontSize: 13, fontWeight: 600, lineHeight: 1.45, wordBreak: "break-word" }}>
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ text }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 999,
        background: "rgba(16,185,129,0.12)",
        border: "1px solid rgba(16,185,129,0.5)",
        color: "#10b981",
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      <CheckCircleOutlined />
      {text}
    </div>
  );
}

// ==============================
// TRANG CHI TIẾT TRACE
// ==============================
export function ProductTracePage() {
  const { maSanPham } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const fetchTrace = async () => {
      if (!maSanPham) return;

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

    fetchTrace();
  }, [maSanPham]);

  if (status === "loading") {
    return (
      <div style={{ padding: 80, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (status === "not_found") {
    return <Alert type="warning" message="Chưa có dữ liệu Blockchain" style={{ margin: 24 }} />;
  }

  if (status === "error") {
    return <Alert type="error" message="Lỗi kết nối Blockchain" style={{ margin: 24 }} />;
  }

  return (
    <>
      <style>{`
        .trace-page {
          padding: 24px;
          background: linear-gradient(180deg, #08111d 0%, #0d1b2a 100%);
          min-height: 100vh;
        }

        .trace-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 20px;
          align-items: stretch;
        }

        .trace-card {
          background: linear-gradient(180deg, rgba(13,27,42,0.98), rgba(10,20,33,0.98));
          border: 1px solid rgba(27,67,124,0.95);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 18px 45px rgba(0,0,0,0.24);
        }

        .scan-frame {
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          background: radial-gradient(circle at top, rgba(240,213,141,0.16), rgba(23,51,84,0.06));
          padding: 22px;
          border: 1px solid rgba(240,213,141,0.18);
        }

        .scan-frame::after {
          content: "";
          position: absolute;
          left: 18px;
          right: 18px;
          height: 3px;
          top: 18px;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent, rgba(240,213,141,0.95), transparent);
          box-shadow: 0 0 16px rgba(240,213,141,0.65);
          animation: scanMove 2.2s linear infinite;
          pointer-events: none;
        }

        @keyframes scanMove {
          0%   { transform: translateY(0); opacity: 0.2; }
          15%  { opacity: 1; }
          50%  { transform: translateY(210px); opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(0); opacity: 0.2; }
        }

        @media (max-width: 900px) {
          .trace-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="trace-page">
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              marginBottom: 18,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ color: "#f0d58d", fontSize: 12, fontWeight: 700, letterSpacing: 1.2 }}>
                TRACEABILITY DASHBOARD
              </div>
              <h2 style={{ margin: "6px 0 0", color: "#fff", fontSize: 26, lineHeight: 1.2 }}>
                Truy xuất nguồn gốc sản phẩm
              </h2>
            </div>

            <StatusPill text="Xuất xưởng / Lên chuỗi" />
          </div>

          <div className="trace-grid">
            <div className="trace-card">
              <div
                style={{
                  color: "#f0d58d",
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <BlockOutlined /> Thông tin sản phẩm
              </div>

              <div
                style={{
                  background: "linear-gradient(135deg, #173354, #1b437c)",
                  height: 160,
                  borderRadius: 18,
                  marginBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(240,213,141,0.15)",
                }}
              >
                <CodeSandboxOutlined style={{ fontSize: 54, color: "#f0d58d", opacity: 0.9 }} />
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <InfoRow icon={<BlockOutlined />} label="Tên sản phẩm" value={data?.tenSanPham} />
                <InfoRow icon={<EnvironmentOutlined />} label="Nhà cung cấp" value={data?.tenNhaCungCap} />
                <InfoRow icon={<FieldTimeOutlined />} label="Ngày sản xuất" value={data?.ngaySanXuat} />
                <InfoRow icon={<FieldTimeOutlined />} label="Ghi on-chain" value={data?.thoiGianTao} valueColor="#f0d58d" />
                <InfoRow
                  icon={<ScanOutlined />}
                  label="Mã serial (định danh)"
                  value={maSanPham}
                  valueColor="#f0d58d"
                />
              </div>
            </div>

            <div className="trace-card">
              <div
                style={{
                  color: "#f0d58d",
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <EnvironmentOutlined /> Bản đồ vị trí
                </span>
                <span
                  style={{
                    background: "rgba(240,213,141,0.12)",
                    color: "#f0d58d",
                    padding: "6px 11px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Điểm xuất phát
                </span>
              </div>

              <div style={{ borderRadius: 18, overflow: "hidden" }}>
                <SupplierMap diaChi={data?.diaChiNhaCungCap} />
              </div>

              <p style={{ margin: "12px 0 0", fontSize: 11, color: "#64748b", textAlign: "center", fontStyle: "italic" }}>
                Vị trí hiển thị dựa trên địa chỉ được ghi trên blockchain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ==============================
// NÚT / THẺ MỞ QR
// ==============================
export default function ProductTrace({ maSanPham, disabled = false }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const webTraceUrl = `${FRONTEND_BASE}/trace/${maSanPham}`;

  const goToDetailPage = () => {
    setOpen(false);
    navigate(`/trace/${maSanPham}`);
  };

  return (
    <>
      <style>{`
        .trace-trigger {
          background: linear-gradient(180deg, #173354 0%, #11263f 100%);
          border-radius: 20px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          max-width: 520px;
          box-shadow: 0 12px 34px rgba(23,51,84,0.18);
          border: 1px solid rgba(27,67,124,0.95);
        }

        .trace-qr-wrap {
          position: relative;
          overflow: hidden;
          background: #fff;
          padding: 12px;
          border-radius: 18px;
          min-width: 244px;
          max-width: 244px;
          cursor: pointer;
        }

        .trace-qr-wrap::after {
          content: "";
          position: absolute;
          left: 10px;
          right: 10px;
          height: 3px;
          top: 10px;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent, rgba(23,51,84,0.95), transparent);
          box-shadow: 0 0 16px rgba(23,51,84,0.45);
          animation: scanMove 2.2s linear infinite;
          pointer-events: none;
        }

        .trace-card-row {
          display: flex;
          gap: 18px;
          align-items: center;
        }

        @media (max-width: 560px) {
          .trace-card-row {
            flex-direction: column;
            align-items: stretch;
          }

          .trace-qr-wrap {
            max-width: 100%;
            min-width: 0;
          }
        }
      `}</style>

      <div className="trace-trigger">
        <div className="trace-card-row">
          <div className="trace-qr-wrap" onClick={goToDetailPage} title="Quét hoặc bấm để xem chi tiết">
            <QRCodeCanvas url={webTraceUrl} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#f0d58d", fontSize: 11, fontWeight: 800, letterSpacing: 1.5, marginBottom: 6 }}>
              GENUINE PRODUCT
            </div>

            <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, marginBottom: 8, wordBreak: "break-word" }}>
              {maSanPham}
            </div>

            <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
              Bấm để hiện QR. Quét QR để mở trang truy xuất nguồn gốc có thông tin sản phẩm và bản đồ.
            </div>

            <Button
              type="primary"
              onClick={() => setOpen(true)}
              disabled={disabled}
              style={{
                height: 44,
                borderRadius: 12,
                background: disabled ? "#475569" : "#f0d58d",
                borderColor: disabled ? "#475569" : "#f0d58d",
                color: disabled ? "#94a3b8" : "#173354",
                fontWeight: 800,
                width: "100%",
              }}
            >
              Xem mã QR <ArrowRightOutlined />
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={560}
        destroyOnClose
        closeIcon={<div style={{ color: "#f0d58d", fontSize: 18, marginTop: 8 }}>✕</div>}
        styles={{
          content: {
            background: "linear-gradient(180deg, #173354 0%, #0d1b2a 100%)",
            padding: "28px 22px",
            border: "1px solid rgba(240,213,141,0.45)",
            borderRadius: 22,
          },
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ color: "#f0d58d", fontSize: 12, fontWeight: 800, letterSpacing: 1.4 }}>
            QUÉT MÃ ĐỂ TRUY XUẤT
          </div>
          <h3 style={{ margin: "8px 0 0", color: "#fff", fontSize: 22 }}>QR truy xuất nguồn gốc</h3>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 16,
            justifyItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 14,
              borderRadius: 20,
              width: "fit-content",
              boxShadow: "0 14px 36px rgba(0,0,0,0.25)",
            }}
          >
            <div className="scan-frame">
              <QRCodeCanvas url={webTraceUrl} size={240} />
            </div>
          </div>

          <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7, textAlign: "center" }}>
            Dùng điện thoại quét QR để mở trang chi tiết.
            <br />
            Hoặc bấm nút dưới đây để vào trang truy xuất ngay.
          </div>

          <Button
            onClick={goToDetailPage}
            style={{
              height: 46,
              borderRadius: 14,
              width: "100%",
              background: "#f0d58d",
              borderColor: "#f0d58d",
              color: "#173354",
              fontWeight: 800,
            }}
          >
            Xem chi tiết nguồn gốc <EyeOutlined />
          </Button>
        </div>
      </Modal>
    </>
  );
}