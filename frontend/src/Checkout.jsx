import { useState, useEffect } from 'react';
import {
  Form, Input, Button, message, Divider,
  Radio, Tag, Spin, Steps, Modal
} from 'antd';
import {
  ArrowLeftOutlined, UserOutlined, PhoneOutlined,
  TagOutlined, CheckCircleFilled, ShoppingOutlined,
  CreditCardOutlined, SafetyOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import styles from './Checkout.module.css';
import AddressSelector from './AddressSelector.jsx';

const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';
const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p ?? 0);

const PAYMENT_METHODS = [
  {
    id: 1,
    icon: '💵',
    name: 'Thanh toán khi nhận hàng (COD)',
    desc: 'Trả tiền mặt khi nhận được hàng',
    gateway: null,
  },
  {
    id: 2,
    icon: '🏦',
    name: 'Chuyển khoản ngân hàng',
    desc: 'Chuyển khoản trước — đơn xử lý sau khi xác nhận',
    gateway: null,
  },
  {
    id: 3,
    icon: null,
    name: 'MoMo',
    desc: 'Thanh toán qua ví MoMo — chuyển hướng tới cổng thanh toán',
    gateway: 'momo',
    logo: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png',
  },
  {
    id: 4,
    icon: null,
    name: 'ZaloPay',
    desc: 'Thanh toán qua ZaloPay — chuyển hướng tới cổng thanh toán',
    gateway: 'zalopay',
    logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png',
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedItems = [], cartItems = [], applyVoucher = null } = location.state || {};
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(1);
  const [addressError, setAddressError] = useState('');
  const [voucherInput, setVoucherInput] = useState(applyVoucher?.TenKhuyenMai || '');
  const [appliedVoucher, setAppliedVoucher] = useState(applyVoucher || null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [myVouchers, setMyVouchers] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [redirectingModal, setRedirectingModal] = useState(false);

  const [shippingMethod, setShippingMethod] = useState(1); 
  const [addressData, setAddressData] = useState({ string: '', obj: null });
  
  const [shippingFee, setShippingFee] = useState(0);
  const [calculatingFee, setCalculatingFee] = useState(false);

  const orderItems = cartItems.filter((i) => selectedItems.includes(i.variantId));
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedVoucher ? Math.min(appliedVoucher.GiaTri, appliedVoucher.GiamToiDa ?? Infinity) : 0;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const selectedPayment = PAYMENT_METHODS.find((m) => m.id === paymentMethod);

  useEffect(() => {
    if (cartItems.length === 0) {
      message.warning('Bạn chưa chọn sản phẩm nào để thanh toán!');
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  useEffect(() => {
    if (orderItems.length === 0) navigate('/cart');
    if (isLoggedIn) { fetchProfile(); fetchMyVouchers(); }
    else setProfileLoading(false);
  }, []);

  useEffect(() => {
    const fetchShippingFee = async () => {
      if (shippingMethod === 3) {
        setShippingFee(0);
        return;
      }

      if (!addressData.obj || !addressData.obj.ToDistrictID || !addressData.obj.ToWardID) {
        setShippingFee(0);
        return;
      }

      setCalculatingFee(true);
      try {
        const res = await axios.post(`${API_BASE}/orders/calculate-fee`, {
          MaPhi: shippingMethod,
          addressObj: addressData.obj,
          items: orderItems.map(i => ({ MaBienThe: i.variantId, soLuong: i.quantity }))
        }, isLoggedIn ? authHeader : {});

        setShippingFee(res.data?.data?.total || 30000);
      } catch (err) {
        console.warn("Chưa có API tính phí hoặc lỗi:", err);
        setShippingFee(30000);
      } finally {
        setCalculatingFee(false);
      }
    };

    fetchShippingFee();
  }, [shippingMethod, addressData.obj, orderItems, isLoggedIn]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/auth/me`, authHeader);
      const profile = res.data.user?.profile;
      if (profile) {
        form.setFieldsValue({ name: profile.TenKhachHang, phone: profile.SDT });
      }
    } catch {}
    finally { setProfileLoading(false); }
  };

  const fetchMyVouchers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/vouchers/me`, authHeader);
      setMyVouchers(res.data?.vouchers || []);
    } catch {}
  };

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    setVoucherLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/promotions`);
      const all = res.data?.vouchers || [];
      const found = all.find(
        (v) => v.TenKhuyenMai?.toLowerCase() === voucherInput.trim().toLowerCase()
          || String(v.MaKhuyenMai) === voucherInput.trim()
      );
      if (!found) { message.error('Mã voucher không tồn tại hoặc đã hết hạn!'); return; }
      if (found.GiaTriToiThieu && subtotal < Number(found.GiaTriToiThieu)) {
        message.error(`Đơn tối thiểu ${fmt(found.GiaTriToiThieu)} để dùng mã này!`); return;
      }
      setAppliedVoucher(found);
      message.success('Áp dụng voucher thành công!');
    } catch { message.error('Không thể kiểm tra voucher!'); }
    finally { setVoucherLoading(false); }
  };

  const handleSelectMyVoucher = (v) => {
    const promo = v.KhuyenMai || v;
    if (promo.GiaTriToiThieu && subtotal < Number(promo.GiaTriToiThieu)) {
      message.warning(`Đơn tối thiểu ${fmt(promo.GiaTriToiThieu)} để dùng mã này!`); return;
    }
    setAppliedVoucher(promo);
    setVoucherInput(promo.TenKhuyenMai);
    message.success('Đã áp dụng voucher!');
  };

  const createOrder = async (values) => {
    const payload = {
        TenNguoiNhan: values.name,
        SDT: values.phone, 
        DiaChiGiaoHang: shippingMethod === 3 ? "Nhận tại cửa hàng" : addressData.string,
        GhiChu: values.note || '',
        MaPhuongThuc: paymentMethod,
        MaPhi: shippingMethod, 
        addressObj: shippingMethod === 3 ? null : addressData.obj, 
        ListMaKhuyenMai: appliedVoucher ? [appliedVoucher.MaKhuyenMai] : [],
        
        items: orderItems.map((i) => ({
            MaBienThe: i.variantId,
            SoLuong: i.quantity,
            DonGia: i.price
        })), 
    };

    let res;
    if (isLoggedIn) {
        res = await axios.post(`${API_BASE}/orders`, payload, authHeader);
    } else {
        res = await axios.post(`${API_BASE}/orders/guest`, {
            ...payload,
            GuestEmail: values.email,
            cartItems: payload.items 
        });
    }
    return res.data?.result?.orderID || res.data?.result?.MaDonHang;
  };

  const handleOrder = async (values) => {
    if (shippingMethod !== 3 && (!addressData.string || addressData.string.split(',').length < 3)) {
      setAddressError('Vui lòng chọn đầy đủ tỉnh/huyện/xã và nhập số nhà!');
      return;
    }
    
    setAddressError('');
    setLoading(true);

    try {
      const newOrderId = await createOrder(values);
      setOrderId(newOrderId);

      if (paymentMethod === 1 || paymentMethod === 2) {
        setStep(1);
        message.success('Đặt hàng thành công!');
        return;
      }

      if (paymentMethod === 3) {
        setRedirectingModal(true);
        const payUrl = await createMomoPayment(newOrderId);
        if (payUrl) window.location.href = payUrl;
        else throw new Error('Không nhận được link thanh toán MoMo');
        return;
      }

      if (paymentMethod === 4) {
        setRedirectingModal(true);
        const payUrl = await createZaloPayPayment(newOrderId);
        if (payUrl) window.location.href = payUrl;
        else throw new Error('Không nhận được link thanh toán ZaloPay');
        return;
      }

    } catch (err) {
      setRedirectingModal(false);
      message.error(err.response?.data?.message || err.message || 'Đặt hàng thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const createMomoPayment = async (maDonHang) => {
    const res = await axios.post(`${API_BASE}/payment/momo-create`, { maDonHang }, authHeader);
    return res.data?.paymentUrl;
  };

  const createZaloPayPayment = async (maDonHang) => {
    const res = await axios.post(`${API_BASE}/payment/zalo-create`, { maDonHang }, authHeader);
    return res.data?.payUrl;
  };

  if (step === 1) {
    return (
      <div className={styles.pageWrapper}>
        <Helmet><title>Đặt hàng thành công | Ceramic Shop</title></Helmet>
        <header className={styles.topHeader}>
          <div className={styles.logo} onClick={() => navigate('/')}>CERAMIC-SHOP</div>
        </header>
        <div className={styles.successWrapper}>
          <div className={styles.successCard}>
            <CheckCircleFilled className={styles.successIcon} />
            <h2 className={styles.successTitle}>Đặt hàng thành công!</h2>
            {orderId && <p className={styles.successOrderId}>Mã đơn hàng: <strong>#{orderId}</strong></p>}
            <p className={styles.successSub}>
              Cảm ơn bạn đã mua sắm tại Ceramic Shop!<br />
              Chúng tôi sẽ xử lý và liên hệ sớm nhất.
            </p>

            {paymentMethod === 2 && (
              <div className={styles.bankInfo}>
                <div className={styles.bankTitle}>Thông tin chuyển khoản</div>
                <div className={styles.bankRow}><span>Ngân hàng</span><strong>Vietcombank</strong></div>
                <div className={styles.bankRow}><span>Số tài khoản</span><strong>1234567890</strong></div>
                <div className={styles.bankRow}><span>Chủ tài khoản</span><strong>CERAMIC SHOP</strong></div>
                <div className={styles.bankRow}><span>Số tiền</span><strong style={{ color: '#d0021b' }}>{fmt(total)}</strong></div>
                <div className={styles.bankRow}><span>Nội dung</span><strong>DH{orderId}</strong></div>
              </div>
            )}

            <div className={styles.successActions}>
              {isLoggedIn && (
                <Button className={styles.btnOrders} onClick={() => navigate('/orders')}>
                  Theo dõi đơn hàng
                </Button>
              )}
              <Button type="primary" className={styles.btnHome} onClick={() => navigate('/')}>
                Về trang chủ
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Helmet><title>Thanh toán | Ceramic Shop</title></Helmet>

      <header className={styles.topHeader}>
        <div className={styles.logo} onClick={() => navigate('/')}>CERAMIC-SHOP</div>
        <Button type="link" icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/cart')} className={styles.btnBack}>
          Quay lại giỏ hàng
        </Button>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Thanh toán</h1>
            <Steps size="small" current={0} className={styles.checkoutSteps}
              items={[
                { title: 'Giỏ hàng', icon: <ShoppingOutlined /> },
                { title: 'Thông tin', icon: <UserOutlined /> },
                { title: 'Xác nhận', icon: <CheckCircleFilled /> },
              ]}
            />
          </div>

          {profileLoading ? (
            <div className={styles.loadingWrap}><Spin size="large" /></div>
          ) : (
            <div className={styles.layoutGrid}>
              <div className={styles.leftCol}>
                <Form form={form} layout="vertical" onFinish={handleOrder} scrollToFirstError>

                  <div className={styles.section}>
                    <div className={styles.sectionTitle}><UserOutlined /> Thông tin người nhận</div>
                    {!isLoggedIn && (
                      <Form.Item name="email" label="Email nhận thông báo"
                        rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không đúng!' }]}>
                        <Input prefix={<span style={{ color: '#bbb' }}>@</span>}
                          placeholder="example@email.com" className={styles.input} />
                      </Form.Item>
                    )}
                    <div className={styles.formRow}>
                      <Form.Item name="name" label="Họ tên người nhận"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                        <Input prefix={<UserOutlined style={{ color: '#bbb' }} />}
                          placeholder="Nguyễn Văn A" className={styles.input} />
                      </Form.Item>
                      <Form.Item name="phone" label="Số điện thoại"
                        rules={[
                          { required: true, message: 'Vui lòng nhập SĐT!' },
                          { pattern: /^0\d{9}$/, message: 'SĐT không hợp lệ!' },
                        ]}>
                        <Input prefix={<PhoneOutlined style={{ color: '#bbb' }} />}
                          placeholder="0987654321" maxLength={10} className={styles.input} />
                      </Form.Item>
                    </div>

                    <div className={styles.section} style={{ marginTop: 10, padding: 0, border: 'none' }}>
                        <div className={styles.sectionTitle}>🚚 Phương thức giao hàng</div>
                        <Radio.Group 
                            onChange={(e) => setShippingMethod(e.target.value)} 
                            value={shippingMethod}
                            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                        >
                            <Radio value={1}>Giao hàng nhanh (GHN)</Radio>
                            <Radio value={2}>Giao hỏa tốc (Chỉ áp dụng nội thành Hải Phòng)</Radio>
                            <Radio value={3}>Nhận tại cửa hàng (Miễn phí)</Radio>
                        </Radio.Group>
                    </div>

                    {shippingMethod !== 3 && (
                        <div className={styles.addressBlock} style={{ marginTop: 20 }}>
                        <div className={styles.addressLabel}>
                            Địa chỉ giao hàng <span className={styles.req}>*</span>
                        </div>
                            <AddressSelector 
                                onChange={(addressString, addressObj) => { 
                                    setAddressData({ string: addressString, obj: addressObj }); 
                                    setAddressError(''); 
                                }} 
                            />
                        {addressError && <div className={styles.addressError}>{addressError}</div>}
                        </div>
                    )}

                    <Form.Item name="note" label="Ghi chú (không bắt buộc)" style={{ marginTop: 16 }}>
                      <Input.TextArea placeholder="Yêu cầu đặc biệt..." className={styles.input} rows={2} />
                    </Form.Item>
                  </div>

                  <div className={styles.section}>
                    <div className={styles.sectionTitle}><CreditCardOutlined /> Phương thức thanh toán</div>
                    <div className={styles.paymentList}>
                      {PAYMENT_METHODS.map((pm) => (
                        <div key={pm.id}
                          className={`${styles.paymentOption} ${paymentMethod === pm.id ? styles.paymentActive : ''}`}
                          onClick={() => setPaymentMethod(pm.id)}>
                          <Radio checked={paymentMethod === pm.id} />
                          <div className={styles.paymentIcon}>
                            {pm.logo
                              ? <img src={pm.logo} alt={pm.name} className={styles.gatewayLogo} />
                              : pm.icon}
                          </div>
                          <div>
                            <div className={styles.paymentName}>{pm.name}</div>
                            <div className={styles.paymentDesc}>{pm.desc}</div>
                          </div>
                          {pm.gateway && (
                            <span className={styles.onlineTag}>Trực tuyến</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.section}>
                    <div className={styles.sectionTitle}><TagOutlined /> Mã voucher</div>
                    {appliedVoucher ? (
                      <div className={styles.appliedVoucher}>
                        <div className={styles.voucherInfo}>
                          <Tag color="green">✓ Đã áp dụng</Tag>
                          <span className={styles.voucherName}>{appliedVoucher.TenKhuyenMai}</span>
                          <span className={styles.voucherDiscount}>-{fmt(discount)}</span>
                        </div>
                        <Button size="small" danger onClick={() => { setAppliedVoucher(null); setVoucherInput(''); }}>Bỏ</Button>
                      </div>
                    ) : (
                      <div className={styles.voucherInputRow}>
                        <Input value={voucherInput} onChange={(e) => setVoucherInput(e.target.value)}
                          placeholder="Nhập mã voucher..." className={styles.input}
                          onPressEnter={handleApplyVoucher}
                          prefix={<TagOutlined style={{ color: '#bbb' }} />} />
                        <Button onClick={handleApplyVoucher} loading={voucherLoading}
                          className={styles.btnApplyVoucher}>Áp dụng</Button>
                      </div>
                    )}
                    {myVouchers.length > 0 && !appliedVoucher && (
                      <div className={styles.myVouchers}>
                        <div className={styles.myVouchersTitle}>Voucher của bạn:</div>
                        <div className={styles.voucherCards}>
                          {myVouchers.slice(0, 3).map((v, i) => {
                            const promo = v.KhuyenMai || v;
                            const eligible = !promo.GiaTriToiThieu || subtotal >= Number(promo.GiaTriToiThieu);
                            return (
                              <div key={i}
                                className={`${styles.voucherCard} ${!eligible ? styles.voucherDisabled : ''}`}
                                onClick={() => eligible && handleSelectMyVoucher(v)}>
                                <div className={styles.voucherCardLeft}><TagOutlined className={styles.voucherCardIcon} /></div>
                                <div className={styles.voucherCardRight}>
                                  <div className={styles.voucherCardName}>{promo.TenKhuyenMai}</div>
                                  <div className={styles.voucherCardValue}>
                                    Giảm {fmt(promo.GiaTri)}{promo.GiamToiDa ? ` (tối đa ${fmt(promo.GiamToiDa)})` : ''}
                                  </div>
                                  {promo.GiaTriToiThieu && (
                                    <div className={styles.voucherCardMin}>
                                      {eligible ? '✓ Đủ điều kiện' : `Đơn tối thiểu ${fmt(promo.GiaTriToiThieu)}`}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="primary" htmlType="submit" block loading={loading || calculatingFee}
                    className={styles.btnOrder} size="large">
                    <SafetyOutlined />
                    {selectedPayment?.gateway
                      ? `THANH TOÁN QUA ${selectedPayment.name.toUpperCase()} • ${fmt(total)}`
                      : `ĐẶT HÀNG • ${fmt(total)}`}
                  </Button>

                  {selectedPayment?.gateway && (
                    <p className={styles.gatewayNote}>
                      Bạn sẽ được chuyển sang trang thanh toán của <strong>{selectedPayment.name}</strong> sau khi xác nhận đơn hàng.
                    </p>
                  )}
                </Form>
              </div>

              <div className={styles.rightCol}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryTitle}>Đơn hàng ({orderItems.length} sản phẩm)</div>
                  <div className={styles.productList}>
                    {orderItems.map((item) => (
                      <div key={item.variantId} className={styles.productItem}>
                        <div className={styles.productImgWrap}>
                          <img src={item.image || 'https://via.placeholder.com/56'} alt={item.name}
                            className={styles.productImg}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/56'; }} />
                          <span className={styles.qtyBadge}>{item.quantity}</span>
                        </div>
                        <div className={styles.productInfo}>
                          <div className={styles.productName}>{item.name}</div>
                          {item.variantName && <div className={styles.productVariant}>{item.variantName}</div>}
                        </div>
                        <div className={styles.productPrice}>{fmt(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                  <Divider style={{ margin: '14px 0' }} />
                  <div className={styles.summaryRow}><span>Tạm tính</span><span>{fmt(subtotal)}</span></div>
                  
                  <div className={styles.summaryRow}>
                    <span>Phí vận chuyển</span>
                    <span>
                      {calculatingFee 
                        ? <Spin size="small" /> 
                        : shippingMethod === 3 
                          ? <span style={{ color: '#52c41a' }}>Miễn phí</span> 
                          : fmt(shippingFee)
                      }
                    </span>
                  </div>

                  {appliedVoucher && (
                    <div className={styles.summaryRow} style={{ color: '#52c41a' }}>
                      <span>Giảm giá</span><span>-{fmt(discount)}</span>
                    </div>
                  )}
                  <Divider style={{ margin: '12px 0' }} />
                  <div className={styles.summaryTotal}>
                    <span>Tổng cộng</span>
                    <span className={styles.totalPrice}>{fmt(total)}</span>
                  </div>
                  <div className={styles.secureNote}>
                    <SafetyOutlined /> Thanh toán được bảo mật & mã hoá
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={redirectingModal}
        footer={null}
        closable={false}
        centered
        width={320}
      >
        <div className={styles.redirectModal}>
          <Spin size="large" />
          <p className={styles.redirectText}>
            Đang tạo đơn hàng và chuyển hướng sang{' '}
            <strong>{selectedPayment?.name}</strong>...
          </p>
          <p className={styles.redirectSub}>Vui lòng không đóng trang này.</p>
        </div>
      </Modal>
    </div>
  );
}