import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Alert,
  Space,
  Typography,
  Upload,
  Image,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useEffect, useState } from "react";
import styles from "./ReturnRequestModal.module.css";

const { Text } = Typography;

const CLOUDINARY_CLOUD_NAME = "dcmwz0uis";
const CLOUDINARY_UPLOAD_PRESET = "the_creamy_shop";

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

export default function ReturnRequestModal({
  open,
  item,
  loading,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();
  const requestType = Form.useWatch("LoaiYeuCau", form);
  const evidenceUrl = Form.useWatch("AnhMinhChung", form);
  const [uploading, setUploading] = useState(false);

  const maxQuantity = Number(item?.SoLuong || item?.quantity || 1);

  useEffect(() => {
    if (open && item) {
      form.setFieldsValue({
        MaCTDH: item.MaCTDH,
        LoaiYeuCau: "TRA_HANG",
        SoLuongDoiTra: 1,
        TinhTrangHangTra: "CON_NGUYEN",
        AnhMinhChung: null,
      });
    }

    if (!open) {
      form.resetFields();
      setUploading(false);
    }
  }, [open, item, form]);

  const uploadEvidence = async ({ file, onSuccess, onError }) => {
    if (file.size > 5 * 1024 * 1024) {
      message.error("Dung lượng ảnh không được vượt quá 5MB!");
      onError?.(new Error("File too large"));
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
      );

      form.setFieldValue("AnhMinhChung", res.data.secure_url);
      message.success("Upload ảnh minh chứng thành công!");
      onSuccess?.(res.data);
    } catch (error) {
      console.error(error);
      message.error("Upload ảnh minh chứng thất bại!");
      onError?.(error);
    } finally {
      setUploading(false);
    }
  };

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
            Phân loại:{" "}
            {item?.BienTheSanPham?.TenBienThe ||
              item?.TenBienThe ||
              "Không rõ"}
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
          hidden
          rules={
            evidenceRequiredTypes.includes(requestType)
              ? [{ required: true, message: "Vui lòng upload ảnh minh chứng!" }]
              : []
          }
        >
          <Input />
        </Form.Item>

        <div className={styles.uploadBlock}>
          <Text strong>Ảnh minh chứng</Text>
          <div className={styles.muted}>
            Bắt buộc với vỡ/hỏng vận chuyển, thiếu hàng, sai sản phẩm.
          </div>

          <Upload
            accept="image/*"
            maxCount={1}
            showUploadList={false}
            customRequest={uploadEvidence}
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              Chọn ảnh từ máy
            </Button>
          </Upload>

          {evidenceUrl && (
            <Image
              width={120}
              height={120}
              src={evidenceUrl}
              className={styles.previewImage}
            />
          )}
        </div>

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