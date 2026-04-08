import React, { useState, useEffect } from 'react';
import { 
  Layout, Form, Input, Button, message, Divider, Empty, Row, Col, 
  Popconfirm, Checkbox, Spin, Select, Modal, Tag 
} from 'antd';
import { 
  DeleteOutlined, ArrowLeftOutlined, ShoppingCartOutlined, 
  UserOutlined, PhoneOutlined, ShoppingOutlined, LoginOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import styles from './Cart.module.css';
import AddressSelector from './AddressSelector';

const { Header, Content } = Layout;

function Cart() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loginModal, setLoginModal] = useState(false);
  
  const [isFetchingCart, setIsFetchingCart] = useState(true);

  const [cart, setCart] = useState(() => {
    if (localStorage.getItem('session_active')) return [];
    const savedCart = localStorage.getItem('ceramic_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const totalCartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('ceramic_cart', JSON.stringify(cart));
    }
  }, [cart, isLoggedIn]);

  const fetchCartFromDB = async () => {
    try {
      const res = await axios.get('https://ceramic-shop-u8ak.onrender.com/api/v1/cart', {
        withCredentials: true 
      });
      if (res.data.cart && res.data.cart.items) {
        const dbCart = res.data.cart.items.map(item => ({
          id: item.BienTheSanPham.MaSanPham,
          variantId: item.MaBienThe,
          name: `${item.BienTheSanPham.SanPham.TenSanPham} - ${item.BienTheSanPham.TenBienThe}`,
          price: Number(item.BienTheSanPham.Gia),
          quantity: item.SoLuong,
          maxStock: item.BienTheSanPham.SoLuong,
          image: item.BienTheSanPham.HinhAnhBienThes?.[0]?.DuongDan || item.BienTheSanPham.SanPham?.Thumbnail || ''
        }));
        setCart(dbCart);
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingCart(false); 
    }
  };

  useEffect(() => {
    axios.get('https://ceramic-shop-u8ak.onrender.com/api/v1/auth/me', {
      withCredentials: true
    }).then(res => {
      const userData = res.data.user || res.data.result;
      const profileData = userData?.profile || userData;
      setIsLoggedIn(true);
      form.setFieldsValue({
        FullName: profileData?.TenKhachHang || userData?.username,
        SDT: profileData?.SDT || '',
        DiaChi: profileData?.DiaChi || profileData?.Diachi || '',
        Email: userData?.email || userData?.Email || '',
      });
      fetchCartFromDB();
    }).catch(() => {
      setIsLoggedIn(false);
      setIsFetchingCart(false);
    });
  }, [form]);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  const getItemKey = (item) => `${item.id}-${item.variantId}`;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cart.map(getItemKey));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (key, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, key]);
    } else {
      setSelectedItems(prev => prev.filter(k => k !== key));
    }
  };

  const handleRemoveItem = async (id, variantId) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.variantId === variantId)));
    setSelectedItems(prev => prev.filter(k => k !== `${id}-${variantId}`));
    if (isLoggedIn) {
      try {
        await axios.delete(`https://ceramic-shop-u8ak.onrender.com/api/v1/cart/items/${variantId || id}`, {
          withCredentials: true
        });
      } catch (error) {}
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      return message.warning("Vui lòng chọn ít nhất 1 sản phẩm để xóa!");
    }
    const itemsToDelete = cart.filter(item => selectedItems.includes(getItemKey(item)));
    
    setCart(prev => prev.filter(item => !selectedItems.includes(getItemKey(item))));
    setSelectedItems([]);

    if (isLoggedIn) {
      try {
        await Promise.all(itemsToDelete.map(item => 
          axios.delete(`https://ceramic-shop-u8ak.onrender.com/api/v1/cart/items/${item.variantId || item.id}`, {
            withCredentials: true
          })
        ));
      } catch (error) {}
    }
  };

  const updateQty = async (id, variantId, change) => {
    const itemToUpdate = cart.find(item => item.id === id && item.variantId === variantId);
    if (!itemToUpdate) return;
    
    let newQty = itemToUpdate.quantity + change;
    if (newQty < 1) newQty = 1;
    if (itemToUpdate.maxStock && newQty > itemToUpdate.maxStock) {
        newQty = itemToUpdate.maxStock;
        message.info(`Sản phẩm này chỉ còn ${itemToUpdate.maxStock} cái`);
    }
    setCart(prev => prev.map(item => (item.id === id && item.variantId === variantId) ? { ...item, quantity: newQty } : item));

    if (isLoggedIn) {
      try {
        await axios.patch(`https://ceramic-shop-u8ak.onrender.com/api/v1/cart/items/${variantId || id}`, 
          { SoLuong: newQty },
          { withCredentials: true }
        );
      } catch (error) {}
    }
  };

  const handleQtyChange = async (id, variantId, value) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1) {
        const itemToUpdate = cart.find(item => item.id === id && item.variantId === variantId);
        let finalQty = num;
        if (itemToUpdate?.maxStock && num > itemToUpdate.maxStock) {
            finalQty = itemToUpdate.maxStock;
        }
        setCart(prev => prev.map(item => (item.id === id && item.variantId === variantId) ? { ...item, quantity: finalQty } : item));
        
        if (isLoggedIn) {
          try {
            await axios.patch(`https://ceramic-shop-u8ak.onrender.com/api/v1/cart/items/${variantId || id}`, 
              { SoLuong: finalQty },
              { withCredentials: true }
            );
          } catch (error) {}
        }
    }
  };

  const handleQtyBlur = (id, variantId, value) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
      handleQtyChange(id, variantId, 1);
    }
  };

  const selectedCartItems = cart.filter(item => selectedItems.includes(getItemKey(item)));
  const totalCartPrice = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedCartQuantity = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0); 
  
  const shippingFee = selectedCartItems.length > 0 ? 30000 : 0; 
  const finalTotal = selectedCartItems.length > 0 ? totalCartPrice + shippingFee : 0;

  const handleCheckout = async (values) => {
    if (selectedCartItems.length === 0) {
      return message.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
    }

    setSubmitting(true);
    try {
      if (isLoggedIn) {
        const payload = {
          TenNguoiNhan: values.FullName,
          SDTGiaoHang: values.SDT,
          DiaChiGiaoHang: values.DiaChi,
          GhiChu: values.GhiChu || '',
          MaPhuongThuc: Number(values.paymentMethod),
          TongThanhToan: finalTotal,
          items: selectedCartItems.map(item => ({
            MaSanPham: item.id,
            MaBienThe: item.variantId || null,
            SoLuong: item.quantity,
            DonGia: item.price
          }))
        };

        await axios.post('https://ceramic-shop-u8ak.onrender.com/api/v1/orders', payload, {
          withCredentials: true
        });

        await Promise.all(selectedCartItems.map(item => 
          axios.delete(`https://ceramic-shop-u8ak.onrender.com/api/v1/cart/items/${item.variantId || item.id}`, {
            withCredentials: true
          })
        ));
      } else {
        const guestPayload = {
          TenNguoiNhan: values.FullName,
          SDT: values.SDT,
          DiaChiGiaoHang: values.DiaChi,
          GhiChu: values.GhiChu || '',
          MaPhuongThuc: Number(values.paymentMethod),
          GuestEmail: values.Email,
          cartItems: selectedCartItems.map(item => ({
            MaBienThe: item.variantId,
            SoLuong: item.quantity,
            GiaBan: item.price,
            ThanhTien: item.price * item.quantity
          }))
        };
        
        await axios.post('https://ceramic-shop-u8ak.onrender.com/api/v1/orders/guest', guestPayload);
        
        const remainingItems = cart.filter(item => !selectedItems.includes(getItemKey(item)));
        localStorage.setItem('ceramic_cart', JSON.stringify(remainingItems));
      }

      message.success('Đặt hàng thành công!');
      setCart(prev => prev.filter(item => !selectedItems.includes(getItemKey(item))));
      setSelectedItems([]); 
      form.resetFields();
      navigate('/'); 
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout className={styles.cartWrapper}>
      <Helmet>
        <title>Giỏ hàng | The Ceramic Shop</title>
      </Helmet>

      <Header className={styles.topHeader}>
        <div className={styles.logoBox} onClick={() => navigate('/landing')}>
            <img 
                src="https://res.cloudinary.com/dcmwz0uis/image/upload/v1774819165/IMG_20260330_041641_qwo8lc.jpg" 
                alt="Ceramic Shop Logo" 
                className={styles.logoImg} 
            />
            <div className={styles.logoTextWrap}>
                <h1 className={styles.logoText}>CERAMIC-SHOP</h1>
                <span className={styles.logoSub}>TINH HOA GỐM SỨ VIỆT</span>
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          {!isLoggedIn && !isFetchingCart && (
            <Button type="link" icon={<LoginOutlined />} onClick={() => setLoginModal(true)} style={{ fontWeight: 600, color: '#1b437c' }}>
              Đăng nhập
            </Button>
          )}
          
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')} className={styles.btnBack}>
            Tiếp tục mua sắm
          </Button>
        </div>
      </Header>

      <Content className={styles.mainContent}>
        <div className={styles.container}>
          {!isLoggedIn && !isFetchingCart && (
            <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', color: '#d48806', fontWeight: 500 }}>
              🛒 Bạn đang mua sắm với tư cách khách. <span onClick={() => setLoginModal(true)} style={{ color: '#1b437c', textDecoration: 'underline', cursor: 'pointer' }}>Đăng nhập</span> để lưu giỏ hàng và theo dõi đơn hàng dễ dàng hơn.
            </div>
          )}

          <div className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 700, color: '#1b437c', marginBottom: '30px' }}>
            <ShoppingCartOutlined /> Giỏ Hàng Của Bạn
            {totalCartQuantity > 0 && <Tag color="#1b437c" style={{ fontSize: '14px', padding: '2px 10px', borderRadius: '12px' }}>{totalCartQuantity} sản phẩm</Tag>}
          </div>
          
          {isFetchingCart ? (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px', color: '#1b437c', fontWeight: 500 }}>Đang đồng bộ dữ liệu giỏ hàng...</div>
            </div>
          ) : (
            <Row gutter={[30, 30]}>
              <Col xs={24} lg={16}>
                <div className={styles.cartListSection}>
                  {cart.length === 0 ? (
                    <div className={styles.emptyState}>
                      <Empty description="Không có sản phẩm nào trong giỏ hàng" />
                      <Button type="primary" className={styles.btnGoShop} onClick={() => navigate('/')}>
                        Mua sắm ngay
                      </Button>
                    </div>
                  ) : (
                    <div className={styles.cartItemsWrapper}>
                      <div className={styles.selectAllRow}>
                        <Checkbox 
                          checked={selectedItems.length === cart.length && cart.length > 0} 
                          indeterminate={selectedItems.length > 0 && selectedItems.length < cart.length}
                          onChange={handleSelectAll}
                        >
                          <span style={{ fontWeight: 600 }}>Chọn tất cả ({cart.length} loại)</span>
                        </Checkbox>
                        {selectedItems.length > 0 && (
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={handleDeleteSelected} 
                          >
                            Xóa mục đã chọn
                          </Button>
                        )}
                      </div>
                      
                      <div className={styles.cartHeaderRow}>
                        <div className={styles.colCheckbox}></div>
                        <div className={styles.colProduct}>Sản phẩm</div>
                        <div className={styles.colPrice}>Đơn giá</div>
                        <div className={styles.colQty}>Số lượng</div>
                        <div className={styles.colTotal}>Thành tiền</div>
                        <div className={styles.colAction}></div>
                      </div>
                      
                      {cart.map((item, index) => {
                        const itemKey = getItemKey(item);
                        return (
                          <div key={`${itemKey}-${index}`} className={styles.cartItemRow}>
                            <div className={styles.colCheckbox}>
                              <Checkbox 
                                checked={selectedItems.includes(itemKey)} 
                                onChange={(e) => handleSelectItem(itemKey, e.target.checked)} 
                              />
                            </div>
                            <div className={styles.colProduct}>
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className={styles.itemImg} 
                                onClick={() => navigate(`/product/${item.id}`)}
                                style={{ cursor: 'pointer' }}
                                title="Xem chi tiết sản phẩm"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
                              />
                              
                              <span 
                                className={styles.itemName}
                                onClick={() => navigate(`/product/${item.id}`)}
                                style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                                onMouseEnter={(e) => e.target.style.color = '#1b437c'}
                                onMouseLeave={(e) => e.target.style.color = ''}
                                title="Xem chi tiết sản phẩm"
                              >
                                {item.name}
                              </span>
                            </div>
                            <div className={styles.colPrice}>{formatPrice(item.price)}</div>
                            <div className={styles.colQty}>
                              <div className={styles.qtyControls}>
                                <button className={styles.qtyBtn} onClick={() => updateQty(item.id, item.variantId, -1)}>-</button>
                                <input 
                                  type="number" 
                                  className={styles.qtyInput} 
                                  value={item.quantity} 
                                  onChange={(e) => handleQtyChange(item.id, item.variantId, e.target.value)} 
                                  onBlur={(e) => handleQtyBlur(item.id, item.variantId, e.target.value)}
                                />
                                <button className={styles.qtyBtn} onClick={() => updateQty(item.id, item.variantId, 1)}>+</button>
                              </div>
                            </div>
                            <div className={styles.colTotal}>
                              {formatPrice(item.price * item.quantity)}
                            </div>
                            <div className={styles.colAction}>
                              <Popconfirm
                                title="Xóa sản phẩm?"
                                description="Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?"
                                onConfirm={() => handleRemoveItem(item.id, item.variantId)}
                                okText="Xóa"
                                cancelText="Hủy"
                              >
                                <Button type="text" danger icon={<DeleteOutlined />} />
                              </Popconfirm>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </Col>

              <Col xs={24} lg={8}>
                <div className={styles.checkoutSection}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#1b437c', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>Tóm tắt đơn hàng</div>
                  <div className={styles.summaryRow}>
                    <span>Sản phẩm đã chọn:</span>
                    <span style={{ fontWeight: 600 }}>{selectedCartQuantity} món</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Tạm tính:</span>
                    <span>{formatPrice(totalCartPrice)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Phí giao hàng:</span>
                    <span>{formatPrice(shippingFee)}</span>
                  </div>
                  <Divider style={{ margin: '15px 0' }} />
                  <div className={styles.summaryRow} style={{ fontSize: '20px', fontWeight: 700, color: '#d0021b' }}>
                    <span>Tổng cộng:</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>

                  <div className={styles.formSection} style={{ marginTop: '30px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#333', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShoppingOutlined /> Thông tin đặt hàng
                    </div>
                    <Form form={form} layout="vertical" onFinish={handleCheckout} scrollToFirstError>
                      {!isLoggedIn && (
                        <Form.Item 
                          label="Email nhận thông báo" 
                          name="Email"
                          rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không đúng định dạng!' }
                          ]}
                        >
                          <Input className={styles.customInput} placeholder="example@email.com" />
                        </Form.Item>
                      )}

                      <Form.Item 
                        label="Họ và tên người nhận" 
                        name="FullName"
                        rules={[{ required: true, message: 'Vui lòng nhập tên người nhận!' }, { min: 2, message: 'Tên quá ngắn!' }]}
                      >
                        <Input prefix={<UserOutlined style={{ color: '#bbb' }} />} className={styles.customInput} placeholder="Nhập họ tên đầy đủ" />
                      </Form.Item>

                      <Form.Item 
                        label="Số điện thoại" 
                        name="SDT"
                        rules={[
                          { required: true, message: 'Vui lòng nhập số điện thoại!' },
                          { pattern: /^0\d{9}$/, message: 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 0)!' }
                        ]}
                      >
                        <Input prefix={<PhoneOutlined style={{ color: '#bbb' }} />} className={styles.customInput} placeholder="0987654321" maxLength={10} />
                      </Form.Item>

                      <Form.Item 
                        label="Địa chỉ nhận hàng" 
                        name="DiaChi"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng!' }]}
                      >
                        <AddressSelector />
                      </Form.Item>

                      <Form.Item 
                        name="paymentMethod"
                        label="Phương thức thanh toán"
                        rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
                      >
                        <Select placeholder="Chọn phương thức" className={styles.customSelect} size="large">
                          <Select.Option value="1">💵 Thanh toán khi nhận hàng (COD)</Select.Option>
                          <Select.Option value="2">🏦 Chuyển khoản ngân hàng</Select.Option>
                          <Select.Option value="3">💳 Ví điện tử (MoMo / ZaloPay)</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item label="Ghi chú đơn hàng" name="GhiChu">
                        <Input.TextArea rows={2} className={styles.customInput} placeholder="Lưu ý cho người giao hàng (nếu có)" />
                      </Form.Item>

                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        className={styles.btnSubmitOrder} 
                        loading={submitting}
                        disabled={selectedCartItems.length === 0}
                        block
                      >
                        {selectedCartItems.length === 0 ? 'Chọn sản phẩm để đặt hàng' : `ĐẶT HÀNG • ${formatPrice(finalTotal)}`}
                      </Button>
                    </Form>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </div>
      </Content>

      <Modal
        open={loginModal}
        onCancel={() => setLoginModal(false)}
        footer={null}
        centered
        width={360}
      >
        <div style={{ textAlign: 'center', padding: '20px 10px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔐</div>
          <h3 style={{ fontSize: '20px', color: '#1b437c', fontWeight: 700, marginBottom: '10px' }}>Đăng nhập tài khoản</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '25px' }}>
            Đăng nhập để lưu giỏ hàng, theo dõi đơn hàng và nhận ưu đãi dành riêng cho thành viên.
          </p>
          <Button type="primary" block style={{ height: '42px', borderRadius: '8px', fontWeight: 600, background: '#1b437c', marginBottom: '12px' }}
            onClick={() => { setLoginModal(false); navigate('/login'); }}>
            ĐĂNG NHẬP
          </Button>
          <Button block style={{ height: '42px', borderRadius: '8px', fontWeight: 600, color: '#1b437c', borderColor: '#1b437c', marginBottom: '15px' }}
            onClick={() => { setLoginModal(false); navigate('/register'); }}>
            Tạo tài khoản mới
          </Button>
          <div onClick={() => setLoginModal(false)} style={{ color: '#888', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>
            Tiếp tục mua sắm không cần đăng nhập →
          </div>
        </div>
      </Modal>

    </Layout>
  );
}

export default Cart;