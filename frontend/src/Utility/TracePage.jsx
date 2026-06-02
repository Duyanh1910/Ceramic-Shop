import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  EnvironmentOutlined,
  FieldTimeOutlined,
  BlockOutlined,
  CodeSandboxOutlined,
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
        }}
      >
        Không có dữ liệu vị trí
      </div>
    );
  }

  const src =
    `https://maps.google.com/maps?q=${encodeURIComponent(
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
        borderRadius: 12,
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
  }, []);

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
          padding: 80,
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
        background: "#08111d",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 1300,
          margin: "auto",
        }}
      >
        <h1
          style={{
            color: "white",
            marginBottom: 20,
          }}
        >
          Truy xuất nguồn gốc
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "420px 1fr",
            gap: 20,
          }}
        >
          <div
            style={{
              background: "#0d1b2a",
              borderRadius: 16,
              padding: 20,
              border: "1px solid #173354",
            }}
          >
            <div
              style={{
                height: 180,
                borderRadius: 12,
                background:
                  "linear-gradient(135deg,#173354,#1b437c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <CodeSandboxOutlined
                style={{
                  fontSize: 60,
                  color: "#f0d58d",
                }}
              />
            </div>

            <h2
              style={{
                color: "white",
              }}
            >
              {data.tenSanPham}
            </h2>

            <div
              style={{
                color: "#94a3b8",
                marginBottom: 20,
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
                  padding: 12,
                  borderRadius: 10,
                  color: "white",
                }}
              >
                <FieldTimeOutlined /> Ngày sản xuất:
                {" "}
                {data.ngaySanXuat}
              </div>

              <div
                style={{
                  background: "#173354",
                  padding: 12,
                  borderRadius: 10,
                  color: "#f0d58d",
                }}
              >
                <BlockOutlined /> Blockchain:
                {" "}
                {data.thoiGianTao}
              </div>

              <div
                style={{
                  background: "#173354",
                  padding: 12,
                  borderRadius: 10,
                  color: "white",
                }}
              >
                Mã sản phẩm:
                {" "}
                {maSanPham}
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#0d1b2a",
              borderRadius: 16,
              padding: 20,
              border: "1px solid #173354",
            }}
          >
            <div
              style={{
                color: "#f0d58d",
                marginBottom: 16,
                fontWeight: 700,
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
  );
}