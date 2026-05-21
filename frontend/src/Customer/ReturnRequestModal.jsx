import { Modal, Form, Input, InputNumber, Select, Button, Alert, Space, Typography } from "antd";
import { useEffect } from "react";
import styles from "./ReturnRequestModal.module.css";

const { Text } = Typography;

const REQUEST_TYPES = [
  { value: "DOI_HANG", label: "Đổi hàng" },
  { value: "TRA_HANG", label: "Trả hàng" },
  { value: "HOAN_TIEN", label: "Hoàn tiền" },
  { value: "VO_HONG_VAN_CHUYEN", label: "Vỡ / hỏng do vận chuyển" },
  { value: "THIEU_HANG", label: "Thiếu hàng" },
  { value: "SAI_SAN_PHAM", label: "Sai sản phẩm / sai màu" },
];

const CONDITIONS = [
  { value: "CON_NGUYEN", label: "Còn nguyên" },
  { value: "DA_SU_DUNG", label: "Đã sử dụng" },
  { value: "VO_HONG", label: "Vỡ / hỏng" },
  { value: "LOI_SAN_XUAT", label: "Lỗi sản xuất" },
  { value: "KHONG_NHAN_LAI", label: "Không nhận lại hàng" },
];

const evidenceRequiredTypes = [
  "VO_HONG_VAN_CHUYEN",
  "THIEU_HANG",
  "SAI_SAN_PHAM",
];

export default function ReturnRequestModal({ open, item, loading, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const requestType = Form.useWatch("LoaiYeuCau", form);
  const maxQuantity = Number(item?.SoLuong || item?.quantity || 1);

  useEffect(() => {
    if (open && item) {
      form.setFieldsValue({
        MaCTDH: item.MaCTDH,
        LoaiYeuCau: "TRA_HANG",
        SoLuongDoiTra: 1,
        TinhTrangHangTra: "CON_NGUYEN",
      });
    }

    if (!open) {
      form.resetFields();
    }
  }, [open, item, form]);

  const submit = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Tạo yêu cầu đổi trả"
      footer={null}
      width={620}
      destroyOnHidden
    >
      <div className={styles.productBox}>
        <div>
          <Text strong>
            {item?.BienTheSanPham?.SanPham?.TenSanPham ||
              item?.SanPham?.TenSanPham ||
              "Sản phẩm"}
          </Text>

          <div className={styles.muted}>
            Phân loại: {item?.BienTheSanPham?.TenBienThe || item?.TenBienThe || "Không rõ"}
          </div>

          <div className={styles.muted}>Số lượng đã mua: {maxQuantity}</div>
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        className={styles.alert}
        message="Yêu cầu đổi trả chỉ được tạo cho đơn hàng đã hoàn thành. Sau khi gửi, admin sẽ kiểm tra và xử lý, chưa có thay đổi kho hoặc hoàn tiền ngay."
      />

      <Form form={form} layout="vertical" className={styles.form}>
        <Form.Item name="MaCTDH" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="LoaiYeuCau"
          label="Loại yêu cầu"
          rules={[{ required: true, message: "Vui lòng chọn loại yêu cầu!" }]}
        >
          <Select options={REQUEST_TYPES} />
        </Form.Item>

        <Form.Item
          name="SoLuongDoiTra"
          label="Số lượng yêu cầu"
          rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
        >
          <InputNumber min={1} max={maxQuantity} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="TinhTrangHangTra"
          label="Tình trạng hàng"
          rules={[{ required: true, message: "Vui lòng chọn tình trạng hàng!" }]}
        >
          <Select options={CONDITIONS} />
        </Form.Item>

        <Form.Item
          name="LyDo"
          label="Lý do / mô tả"
          rules={[{ required: true, message: "Vui lòng nhập lý do đổi trả!" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Mô tả tình trạng sản phẩm, mong muốn xử lý..."
          />
        </Form.Item>

        <Form.Item
          name="AnhMinhChung"
          label="Ảnh minh chứng (URL)"
          tooltip="Có thể dán link ảnh đã upload. Bắt buộc với vỡ/hỏng vận chuyển, thiếu hàng, sai sản phẩm."
          rules={
            evidenceRequiredTypes.includes(requestType)
              ? [{ required: true, message: "Vui lòng nhập ảnh minh chứng!" }]
              : []
          }
        >
          <Input placeholder="https://..." />
        </Form.Item>

        <Space className={styles.footer}>
          <Button onClick={onCancel}>Hủy</Button>

          <Button type="primary" loading={loading} onClick={submit}>
            Gửi yêu cầu
          </Button>
        </Space>
      </Form>
    </Modal>
  );
}