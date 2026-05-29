import { useState } from "react";
import { Button, Modal, Spin } from "antd";
import { SafetyOutlined } from "@ant-design/icons";
import axios from "axios";

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";

export default function ProductTrace({ maSanPham, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTrace = async () => {
    if (!maSanPham || disabled) return;

    setOpen(true);
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/products/${maSanPham}`);
      setData(res.data?.result || null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        icon={<SafetyOutlined />}
        onClick={fetchTrace}
        disabled={disabled}
        style={{ background: "#1b437c", color: "#fff", borderRadius: 8 }}
      >
        Xem nguồn gốc sản phẩm
      </Button>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title="Truy xuất nguồn gốc - Blockchain"
        footer={null}
        width={560}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <Spin size="large" />
          </div>
        ) : data?.tonTai ? (
          <div style={{ fontSize: 15, lineHeight: 1.8 }}>
            <p><b>Tên sản phẩm:</b> {data.tenSanPham}</p>
            <p><b>Nhà cung cấp:</b> {data.tenNhaCungCap}</p>
            <p><b>Địa chỉ nhà cung cấp:</b> {data.diaChiNhaCungCap}</p>
            <p><b>Chất liệu:</b> {data.chatLieu}</p>
            <p><b>Ngày sản xuất:</b> {data.ngaySanXuat}</p>
            <hr style={{ margin: "15px 0", borderColor: "#eee" }} />
            <p style={{ fontSize: 12, color: "gray", marginBottom: 5 }}>
              <b>Ký bởi:</b> {data.nguoiTao}
            </p>
            <p style={{ fontSize: 12, color: "gray", margin: 0 }}>
              <b>Thời gian ghi:</b> {data.thoiGianTao}
            </p>
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "red" }}>
            Chưa có dữ liệu Blockchain cho sản phẩm này.
          </p>
        )}
      </Modal>
    </>
  );
}
