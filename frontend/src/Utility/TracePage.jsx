import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import {
  Alert,
  Spin,
  Card,
  Row,
  Col,
  Image,
  Tag,
  Statistic,
  Descriptions,
  Timeline,
  Table,
  Typography,
} from "antd";

import {
  EnvironmentOutlined,
  FieldTimeOutlined,
  BlockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

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

  const [traceData, setTraceData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [maSanPham]);

  const loadData = async () => {
    try {
      const [traceRes, productRes] =
        await Promise.all([
          axios.get(
            `${API_BASE}/products/${maSanPham}/trace`
          ),
          axios.get(
            `${API_BASE}/products/${maSanPham}`
          ),
        ]);

      setTraceData(traceRes.data.result);
      setProductData(productRes.data.result);
    } catch (err) {
      console.error(err);
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

  if (!productData) {
    return (
      <Alert
        type="error"
        message="Không tìm thấy sản phẩm"
      />
    );
  }

  const variants =
    productData.BienTheSanPhams || [];

  const minPrice =
    variants.length > 0
      ? Math.min(
          ...variants.map((v) =>
            Number(v.Gia)
          )
        )
      : 0;

  const totalStock =
    variants.reduce(
      (sum, v) =>
        sum + Number(v.SoLuong || 0),
      0
    );

  const columns = [
    {
      title: "Biến thể",
      dataIndex: "TenBienThe",
    },
    {
      title: "Giá",
      render: (_, record) =>
        Number(record.Gia).toLocaleString(
          "vi-VN"
        ) + " đ",
    },
    {
      title: "Tồn kho",
      dataIndex: "SoLuong",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <Card
          bordered={false}
          style={{
            borderRadius: 20,
            marginBottom: 24,
          }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={10}>
              <Image
                src={productData.Thumbnail}
                width="100%"
                style={{
                  borderRadius: 16,
                }}
              />
            </Col>

            <Col xs={24} md={14}>
              <Title level={2}>
                {productData.TenSanPham}
              </Title>

              <div
                style={{
                  marginBottom: 16,
                }}
              >
                <Tag color="green">
                  <CheckCircleOutlined />
                  Blockchain Verified
                </Tag>

                <Tag color="blue">
                  {productData.ThuongHieu}
                </Tag>

                <Tag color="gold">
                  {
                    productData
                      ?.DanhMucSanPham
                      ?.TenDanhMuc
                  }
                </Tag>
              </div>

              <Paragraph>
                {productData.MoTa}
              </Paragraph>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Giá thấp nhất"
                value={minPrice}
                precision={0}
              />
            </Card>
          </Col>

          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Tồn kho"
                value={totalStock}
              />
            </Card>
          </Col>

          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Lượt xem"
                value={
                  productData.LuotXem
                }
              />
            </Card>
          </Col>

          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Biến thể"
                value={
                  variants.length
                }
              />
            </Card>
          </Col>
        </Row>

        <Row
          gutter={[24, 24]}
          style={{
            marginTop: 24,
          }}
        >
          <Col xs={24} lg={12}>
            <Card title="Thông tin Blockchain">
              <Descriptions column={1}>
                <Descriptions.Item label="Mã sản phẩm">
                  {traceData?.maSanPham}
                </Descriptions.Item>

                <Descriptions.Item label="Chất liệu">
                  {traceData?.chatLieu}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày sản xuất">
                  {traceData?.ngaySanXuat}
                </Descriptions.Item>

                <Descriptions.Item label="Wallet tạo">
                  <Text copyable>
                    {traceData?.nguoiTao}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Thời gian ghi Blockchain">
                  {traceData?.thoiGianTao}
                </Descriptions.Item>

                <Descriptions.Item label="Tx Hash">
                  {productData?.BlockchainTxHash
                    ? (
                      <Text copyable>
                        {
                          productData.BlockchainTxHash
                        }
                      </Text>
                    )
                    : "Chưa có"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Lịch sử truy xuất">
              <Timeline
                items={[
                  {
                    color: "green",
                    children:
                      "Sản phẩm được sản xuất: " +
                      traceData?.ngaySanXuat,
                  },
                  {
                    color: "blue",
                    children:
                      "Nhà cung cấp: " +
                      (
                        traceData?.tenNhaCungCap ||
                        "Chưa cập nhật"
                      ),
                  },
                  {
                    color: "gold",
                    children:
                      "Đăng ký Blockchain",
                  },
                  {
                    color: "purple",
                    children:
                      traceData?.thoiGianTao,
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>

        <Card
          title="Danh sách biến thể"
          style={{
            marginTop: 24,
          }}
        >
          <Table
            rowKey="MaBienThe"
            columns={columns}
            dataSource={variants}
            pagination={false}
          />
        </Card>

        <Card
          title="Nhà cung cấp"
          style={{
            marginTop: 24,
          }}
        >
          {productData.NhaCungCap ? (
            <>
              <Descriptions column={1}>
                <Descriptions.Item label="Tên">
                  {
                    productData
                      .NhaCungCap
                      .TenNhaCC
                  }
                </Descriptions.Item>

                <Descriptions.Item label="SĐT">
                  {
                    productData
                      .NhaCungCap
                      .SDT
                  }
                </Descriptions.Item>

                <Descriptions.Item label="Địa chỉ">
                  {
                    productData
                      .NhaCungCap
                      .Diachi
                  }
                </Descriptions.Item>
              </Descriptions>

              <SupplierMap
                diaChi={
                  productData
                    .NhaCungCap
                    .Diachi
                }
              />
            </>
          ) : (
            <Alert
              type="info"
              message="Chưa có thông tin nhà cung cấp"
            />
          )}
        </Card>
      </div>
    </div>
  );
}