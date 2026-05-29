import { useState } from 'react';
import { Button, Spin, Modal } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function ProductTrace({ maSanPham }) { // Đã xóa maDonHang khỏi props
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTrace = async () => {
    setOpen(true); 
    setLoading(true);
    try {
      // Đảm bảo URL này khớp với server của bạn
      const res = await axios.get(`https://ceramic-shop-u8ak.onrender.com/api/v1/products/${maSanPham}/trace`);
      setData(res.data.result);
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
        style={{ background: '#1b437c', color: '#fff', borderRadius: 8 }}
      >
        Xem nguồn gốc sản phẩm
      </Button>

      <Modal 
        open={open} 
        onCancel={() => setOpen(false)}
        title="🔗 Truy xuất nguồn gốc — Blockchain"
        footer={null} 
        width={560}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}><Spin size="large" /></div>
        ) : data ? (
          <div style={{ fontSize: '15px', lineHeight: '1.8' }}>
            <p><b>📦 Tên sản phẩm:</b> {data.tenSanPham}</p>
            <p><b>🏭 Nhà cung cấp:</b> {data.tenNhaCungCap}</p>
            <p><b>📍 Địa chỉ NSX:</b> {data.diaChiNhaCungCap}</p>
            <p><b>🏺 Chất liệu:</b> {data.chatLieu}</p>
            <p><b>📅 Ngày sản xuất:</b> {data.ngaySanXuat}</p>
            
            <hr style={{ margin: '15px 0', borderColor: '#eee' }} />
            
            <p style={{ fontSize: 12, color: 'gray', marginBottom: 5 }}>
              <b>Ký bởi (Admin):</b> {data.nguoiTao}
            </p>
            <p style={{ fontSize: 12, color: 'gray', margin: 0 }}>
              <b>Thời gian ghi (Blockchain):</b> {data.thoiGianTao}
            </p>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'red' }}>
            Chưa có dữ liệu Blockchain cho sản phẩm này.
          </p>
        )}
      </Modal>
    </>
  );
}