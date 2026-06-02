import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  EnvironmentOutlined,
  FieldTimeOutlined,
  BlockOutlined,
  CodeSandboxOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Alert, Spin } from "antd";
import axios from "axios";

const API_BASE =
  "https://ceramic-shop-u8ak.onrender.com/api/v1";

function SupplierMap({ diaChi }) {
  if (!diaChi) {
    return (
      <div
        style={{
          height: 350,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
        }}
      >
        Không có dữ liệu vị trí
      </div>
    );
  }

  const src = `https://maps.google.com/maps?q=${encodeURIComponent(
    diaChi
  )}&hl=vi&z=15&output=embed`;

  return (
    <iframe
      title="map"
      src={src}
      width="100%"
      height="350"
      style={{
        border: 0,
        borderRadius: 16,
      }}
    />
  );
}

export default function TracePage() {
  const { maSanPham } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrace();
  }, [maSanPham]);

  const loadTrace = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/products/${maSanPham}/trace`
      );

      setData(res.data.result);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div
        style={{
          padding: 100,
          textAlign: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!data?.tonTai) {
    return (
      <Alert
        type="warning"
        message="Không tìm thấy dữ liệu Blockchain"
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#071018 0%,#0f1f35 50%,#132743 100%)",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            color: "#fff",
            fontSize: 36,
            marginBottom: 10,
            fontWeight: 700,
          }}
        >
          Truy xuất nguồn gốc sản phẩm
        </h1>

        <div
          style={{
            background: "rgba(34,197,94,.15)",
            border: "1px solid rgba(34,197,94,.3)",
            color: "#4ade80",
            padding: "12px 20px",
            borderRadius: 12,
            marginBottom: 24,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 600,
          }}
        >
          <CheckCircleOutlined />
          Đã xác thực trên Blockchain
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "420px 1fr",
            gap: 24,
          }}
        >
          {/* LEFT */}
          <div
            style={{
              background: "rgba(255,255,255,.05)",
              backdropFilter: "blur(15px)",
              borderRadius: 20,
              padding: 24,
              border:
                "1px solid rgba(255,255,255,.08)",
              boxShadow:
                "0 10px 40px rgba(0,0,0,.25)",
            }}
          >
            <div
              style={{
                width: 130,
                height: 130,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg,#f0d58d,#d4a84f)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto 20px",
              }}
            >
              <CodeSandboxOutlined
                style={{
                  fontSize: 60,
                  color: "#173354",
                }}
              />
            </div>

            <h2
              style={{
                color: "#fff",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {data.tenSanPham}
            </h2>

            <div
              style={{
                textAlign: "center",
                color: "#94a3b8",
                marginBottom: 24,
              }}
            >
              {data.tenNhaCungCap}
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              <div
                style={{
                  background: "#173354",
                  padding: 14,
                  borderRadius: 12,
                  color: "#fff",
                }}
              >
                <FieldTimeOutlined />
                {" "}
                Ngày sản xuất:
                <br />
                <strong>
                  {data.ngaySanXuat}
                </strong>
              </div>

              <div
                style={{
                  background: "#173354",
                  padding: 14,
                  borderRadius: 12,
                  color: "#f0d58d",
                }}
              >
                <BlockOutlined />
                {" "}
                Blockchain:
                <br />
                <strong>
                  {data.thoiGianTao}
                </strong>
              </div>

              <div
                style={{
                  background: "#173354",
                  padding: 14,
                  borderRadius: 12,
                  color: "#fff",
                }}
              >
                Mã sản phẩm:
                <br />
                <strong>
                  {data.maSanPham}
                </strong>
              </div>

              <div
                style={{
                  background: "#173354",
                  padding: 14,
                  borderRadius: 12,
                  color: "#fff",
                  wordBreak: "break-all",
                }}
              >
                Wallet tạo:
                <br />
                <small>
                  {data.nguoiTao}
                </small>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,.05)",
                backdropFilter: "blur(15px)",
                borderRadius: 20,
                padding: 24,
                border:
                  "1px solid rgba(255,255,255,.08)",
              }}
            >
              <h2
                style={{
                  color: "#f0d58d",
                  marginBottom: 20,
                }}
              >
                Hành trình sản phẩm
              </h2>

              <div
                style={{
                  borderLeft:
                    "3px solid #f0d58d",
                  paddingLeft: 24,
                  display: "grid",
                  gap: 24,
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  >
                    Sản xuất
                  </div>

                  <div
                    style={{
                      color: "#94a3b8",
                    }}
                  >
                    {data.ngaySanXuat}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  >
                    Nhà cung cấp
                  </div>

                  <div
                    style={{
                      color: "#94a3b8",
                    }}
                  >
                    {data.tenNhaCungCap}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  >
                    Đăng ký Blockchain
                  </div>

                  <div
                    style={{
                      color: "#94a3b8",
                    }}
                  >
                    {data.thoiGianTao}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,.05)",
                backdropFilter: "blur(15px)",
                borderRadius: 20,
                padding: 24,
                border:
                  "1px solid rgba(255,255,255,.08)",
              }}
            >
              <div
                style={{
                  color: "#f0d58d",
                  fontWeight: 700,
                  marginBottom: 16,
                  fontSize: 18,
                }}
              >
                <EnvironmentOutlined />
                {" "}
                Vị trí nhà cung cấp
              </div>

              <SupplierMap
                diaChi={data.diaChiNhaCungCap}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}