import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, message, Divider, Empty, Row, Col, Popconfirm } from 'antd';
import { DeleteOutlined, ArrowLeftOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import styles from './Cart.module.css';

const { Header, Content } = Layout;

function Cart() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('ceramic_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  useEffect(() => {
    localStorage.setItem('ceramic_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:3000/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const userData = res.data.user || res.data.result;
        const profileData = userData?.profile || userData;
        setIsLoggedIn(true);
        form.setFieldsValue({
          FullName: profileData?.TenKhachHang || userData?.username,
          SDT: profileData?.SDT || '',
          DiaChi: profileData?.DiaChi || profileData?.Diachi || '',
        });
      }).catch(() => {
        setIsLoggedIn(false);
      });
    } else {
      setIsLoggedIn(false);
    }
  }, [form]);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  const handleRemoveItem = (id, variantId) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.variantId === variantId)));
    message.success("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  const updateQty = (id, variantId, change) => {
    const itemToUpdate = cart.find(item => item.id === id && item.variantId === variantId);
    if (!itemToUpdate) return;
    
    let newQty = itemToUpdate.quantity + change;
    if (newQty < 1) newQty = 1;
    if (itemToUpdate.maxStock && newQty > itemToUpdate.maxStock) {
        newQty = itemToUpdate.maxStock;
        message.info(`Sản phẩm này chỉ còn ${itemToUpdate.maxStock} cái`);
    }
    setCart(prev => prev.map(item => (item.id === id && item.variantId === variantId) ? { ...item, quantity: newQty } : item));
  };

  const handleQtyChange = (id, variantId, value) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1) {
        const itemToUpdate = cart.find(item => item.id === id && item.variantId === variantId);
        let finalQty = num;
        if (itemToUpdate?.maxStock && num > itemToUpdate.maxStock) {
            finalQty = itemToUpdate.maxStock;
        }
        setCart(prev => prev.map(item => (item.id === id && item.variantId === variantId) ? { ...item, quantity: finalQty } : item));
    }
  };

  const handleQtyBlur = (id, variantId, value) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
      setCart(prev => prev.map(item => (item.id === id && item.variantId === variantId) ? { ...item, quantity: 1 } : item));
    }
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = cart.length > 0 ? 30000 : 0; 
  const finalTotal = totalCartPrice + shippingFee;

  const handleCheckout = async (values) => {
    if (cart.length === 0) {
      return message.warning("Giỏ hàng của bạn đang trống!");
    }

    if (!isLoggedIn) {
      message.info("Vui lòng đăng nhập để tiến hành đặt hàng!");
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        TenNguoiNhan: values.FullName,
        SDTGiaoHang: values.SDT,
        DiaChiGiaoHang: values.DiaChi,
        GhiChu: values.GhiChu || '',
        TongThanhToan: finalTotal,
        items: cart.map(item => ({
          MaSanPham: item.id,
          MaBienThe: item.variantId || null,
          SoLuong: item.quantity,
          DonGia: item.price
        }))
      };

      await axios.post('http://localhost:3000/api/v1/orders', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success('Đặt hàng thành công!');
      
      setCart([]); 
      localStorage.removeItem('ceramic_cart');
      navigate('/'); 
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className={styles.cartWrapper}>
      <Helmet>
        <title>Giỏ hàng | The Ceramic Shop</title>
      </Helmet>

      <Header className={styles.topHeader}>
        <div className={styles.logo} onClick={() => navigate('/')}>CERAMIC-SHOP</div>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} className={styles.btnBack}>
          Tiếp tục mua sắm
        </Button>
      </Header>

      <Content className={styles.mainContent}>
        <div className={styles.container}>
          <h2 className={styles.pageTitle}><ShoppingCartOutlined /> Giỏ Hàng Của Bạn</h2>
          
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
                    <div className={styles.cartHeaderRow}>
                      <div className={styles.colProduct}>Sản phẩm</div>
                      <div className={styles.colPrice}>Đơn giá</div>
                      <div className={styles.colQty}>Số lượng</div>
                      <div className={styles.colTotal}>Thành tiền</div>
                      <div className={styles.colAction}></div>
                    </div>
                    
                    {cart.map((item, index) => (
                      <div key={`${item.id}-${item.variantId || index}`} className={styles.cartItemRow}>
                        <div className={styles.colProduct}>
                          <img src={item.image} alt={item.name} className={styles.itemImg} />
                          <span className={styles.itemName}>{item.name}</span>
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
                        <div className={styles.colTotal} style={{color: '#d0021b', fontWeight: 600}}>
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
                    ))}
                  </div>
                )}
              </div>
            </Col>

            <Col xs={24} lg={8}>
              <div className={styles.checkoutSection}>
                <h3 className={styles.summaryTitle}>Tóm tắt đơn hàng</h3>
                <div className={styles.summaryRow}>
                  <span>Tạm tính:</span>
                  <span>{formatPrice(totalCartPrice)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Phí giao hàng:</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                <Divider style={{ margin: '15px 0' }} />
                <div className={styles.summaryRow} style={{ fontSize: '18px', fontWeight: 700, color: '#d0021b' }}>
                  <span>Tổng cộng:</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>

                <div className={styles.formSection}>
                  <h4 className={styles.formTitle}>Thông tin giao hàng</h4>
                  <Form form={form} layout="vertical" onFinish={handleCheckout}>
                    <Form.Item 
                      label="Họ và tên người nhận" 
                      name="FullName"
                      rules={[{ required: true, message: 'Vui lòng nhập tên người nhận!' }]}
                    >
                      <Input className={styles.customInput} placeholder="Nhập họ tên đầy đủ" />
                    </Form.Item>

                    <Form.Item 
                      label="Số điện thoại" 
                      name="SDT"
                      rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    >
                      <Input className={styles.customInput} placeholder="Nhập số điện thoại liên hệ" />
                    </Form.Item>

                    <Form.Item 
                      label="Địa chỉ nhận hàng" 
                      name="DiaChi"
                      rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng!' }]}
                    >
                      <Input.TextArea rows={3} className={styles.customInput} placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố" />
                    </Form.Item>

                    <Form.Item label="Ghi chú đơn hàng" name="GhiChu">
                      <Input.TextArea rows={2} className={styles.customInput} placeholder="Lưu ý cho người giao hàng (nếu có)" />
                    </Form.Item>

                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      className={styles.btnSubmitOrder} 
                      loading={loading}
                      disabled={cart.length === 0}
                      block
                    >
                      TIẾN HÀNH ĐẶT HÀNG
                    </Button>
                  </Form>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
}

export default Cart;