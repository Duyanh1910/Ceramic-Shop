import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  EnvironmentOutlined,
  FieldTimeOutlined,
  BlockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Alert, Spin } from "antd";
import axios from "axios";
import styles from "./TracePage.module.css";

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";

function SupplierMap({ diaChi }) {
  if (!diaChi) {
    return (
      <div className={styles.mapFallback}>
        Không có dữ liệu vị trí
      </div>
    );
  }

  const src = `https://maps.google.com/maps?q=${encodeURIComponent(
    diaChi
  )}&hl=vi&z=15&output=embed`;

  return (
    <iframe
      className={styles.mapFrame}
      title="map"
      src={src}
    />
  );
}

export default function TracePage() {
  const { maSanPham } = useParams();

  const [data, setData] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrace();
  }, [maSanPham]);

  const loadTrace = async () => {
    try {
      const [traceRes, productRes] = await Promise.all([
        axios.get(`${API_BASE}/products/${maSanPham}/trace`),
        axios.get(`${API_BASE}/products/${maSanPham}`),
      ]);

      setData(traceRes.data.result);
      setProduct(productRes.data.result);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data?.tonTai) {
    return (
      <Alert
        className={styles.traceAlert}
        type="warning"
        message="Không tìm thấy dữ liệu Blockchain"
      />
    );
  }

  const productImage =
    product?.BienTheSanPhams?.[0]?.HinhAnhBienThes?.[0]?.DuongDan ||
    product?.Thumbnail;
  const productionFacility = data.tenNhaCungCap || "Chưa cập nhật";
  const productionAddress = data.diaChiNhaCungCap || "Chưa cập nhật";
  const productionDate = data.ngaySanXuat || "Chưa cập nhật";
  const material = data.chatLieu || "Gốm sứ";

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <h1 className={styles.title}>
          Truy xuất nguồn gốc sản phẩm
        </h1>

        <div className={styles.verifiedBadge}>
          <CheckCircleOutlined />
          Đã xác thực trên Blockchain
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.productCard}>
            <img
              className={styles.productImage}
              src={productImage}
              alt={data.tenSanPham}
            />

            <h2 className={styles.productName}>
              {data.tenSanPham}
            </h2>

            <div className={styles.supplierName}>
              {data.tenNhaCungCap}
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <FieldTimeOutlined /> Ngày sản xuất:
                <br />
                <strong>{data.ngaySanXuat}</strong>
              </div>

              <div className={`${styles.infoItem} ${styles.infoItemAccent}`}>
                <BlockOutlined /> Blockchain:
                <br />
                <strong>{data.thoiGianTao}</strong>
              </div>

              <div className={styles.infoItem}>
                Mã sản phẩm:
                <br />
                <strong>{data.maSanPham}</strong>
              </div>

              <div className={`${styles.infoItem} ${styles.walletItem}`}>
                Wallet tạo:
                <br />
                <small>{data.nguoiTao}</small>
              </div>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                Hành trình sản phẩm
              </h2>

              <div className={styles.timeline}>
                <div>
                  <div className={styles.timelineLabel}>
                    Sản xuất
                  </div>

                  <div className={styles.productionDetails}>
                    <div className={styles.productionRow}>
                      <span className={styles.productionLabel}>
                        Sản xuất tại
                      </span>
                      <strong className={styles.productionValue}>
                        {productionFacility}
                      </strong>
                    </div>

                    <div className={styles.productionRow}>
                      <span className={styles.productionLabel}>
                        Xưởng / cơ sở
                      </span>
                      <strong className={styles.productionValue}>
                        {productionFacility}
                      </strong>
                    </div>

                    <div className={styles.productionRow}>
                      <span className={styles.productionLabel}>
                        Địa chỉ
                      </span>
                      <strong className={styles.productionValue}>
                        {productionAddress}
                      </strong>
                    </div>

                    <div className={styles.productionRow}>
                      <span className={styles.productionLabel}>
                        Ngày sản xuất
                      </span>
                      <strong className={styles.productionValue}>
                        {productionDate}
                      </strong>
                    </div>

                    <div className={styles.productionRow}>
                      <span className={styles.productionLabel}>
                        Chất liệu
                      </span>
                      <strong className={styles.productionValue}>
                        {material}
                      </strong>
                    </div>
                  </div>
                </div>

                <div>
                  <div className={styles.timelineLabel}>
                    Nhà cung cấp
                  </div>

                  <div className={styles.timelineValue}>
                    {data.tenNhaCungCap}
                  </div>
                </div>

                <div>
                  <div className={styles.timelineLabel}>
                    Đăng ký Blockchain
                  </div>

                  <div className={styles.timelineValue}>
                    {data.thoiGianTao}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.sectionCard}>
              <div className={styles.locationTitle}>
                <EnvironmentOutlined /> Vị trí nhà cung cấp
              </div>

              <SupplierMap diaChi={data.diaChiNhaCungCap} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
