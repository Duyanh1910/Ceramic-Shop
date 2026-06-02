import { useState, useEffect, useRef } from "react";
import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowRightOutlined, EyeOutlined } from "@ant-design/icons";
import QRCode from "qrcode";

const FRONTEND_BASE = "https://ceramic-shop-rho.vercel.app";

function QRCanvas({ url, size = 240 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !url) return;

    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 1,
      color: {
        dark: "#173354",
        light: "#ffffff",
      },
    });
  }, [url, size]);

  return <canvas ref={canvasRef} />;
}

export default function ProductTrace({
  maSanPham,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const webTraceUrl =
    `${FRONTEND_BASE}/trace/${maSanPham}`;

  const goToTrace = () => {
    navigate(`/trace/${maSanPham}`);
  };

  return (
    <>
      <style>{`
        .trace-btn{
          background:#173354;
          color:white;
          border:none;
          padding:14px 24px;
          border-radius:10px;
          font-weight:700;
          cursor:pointer;
        }

        .scan-frame{
          position:relative;
          overflow:hidden;
          border-radius:16px;
        }

        .scan-frame::after{
          content:"";
          position:absolute;
          left:10px;
          right:10px;
          height:3px;
          background:#00ff88;
          box-shadow:0 0 12px #00ff88;
          animation:scanMove 2s linear infinite;
        }

        @keyframes scanMove{
          0%{
            top:10px;
          }
          50%{
            top:240px;
          }
          100%{
            top:10px;
          }
        }
      `}</style>

      <button
        className="trace-btn"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        Truy xuất nguồn gốc
        <ArrowRightOutlined style={{ marginLeft: 8 }} />
      </button>

      <Modal
        open={open}
        footer={null}
        width={550}
        onCancel={() => setOpen(false)}
      >
        <div
          style={{
            textAlign: "center",
            padding: 20,
          }}
        >
          <h2>Quét mã QR</h2>

          <div
            style={{
              background: "#fff",
              padding: 12,
              borderRadius: 16,
              width: "fit-content",
              margin: "20px auto",
            }}
          >
            <div className="scan-frame">
              <QRCanvas
                url={webTraceUrl}
                size={260}
              />
            </div>
          </div>

          <p>
            Quét mã QR hoặc bấm nút dưới đây
            để xem chi tiết sản phẩm.
          </p>

          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={goToTrace}
          >
            Xem chi tiết
          </Button>
        </div>
      </Modal>
    </>
  );
}