import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, message, Divider, Empty, Row, Col, Popconfirm, Checkbox, Spin } from 'antd';
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
  const [selectedItems, setSelectedItems] = useState([]);
  
  const [isFetchingCart, setIsFetchingCart] = useState(!!localStorage.getItem('token'));

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('ceramic_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('ceramic_cart', JSON.stringify(cart));
    }
  }, [cart, isLoggedIn]);

  const fetchCartFromDB = async (token) => {
    try {
      const res = await axios.get('https://ceramic-shop-u8ak.onrender.com/api/v1/cart', {
        headers: { Authorization: `Bearer ${token}` }
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
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('https://ceramic-shop-u8ak.onrender.com/api/v1/auth/me', {
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
        fetchCartFromDB(token);
      }).catch(() => {
        setIsLoggedIn(false);
        setIsFetchingCart(false); 
      });
    } else {
      setIsLoggedIn(false);
      setIsFetchingCart(false); 
    }
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
        const token = localStorage.getItem('token');
        await axios.delete(`https://ceramic-shop-u8ak.onrender.com/api/v1/cart/items/${variantId || id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
      }
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
        const token = localStorage.getItem('token');
        await Promise.all(itemsToDelete.map(item => 
          axios.delete(`https://ceramic-shop-u8ak.onrender.com/api/v1/cart/items/${item.variantId || item.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ));
      } catch (error) {
      }
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
        const token = localStorage.getItem('token');
        await axios.patch(`https://ceramic-shop-u8ak.onrender.com/api/v1/cart/items/${variantId || id}`, 
          { SoLuong: newQty },
          { headers: { Authorization: `Bearer ${token}` }}
        );
      } catch (error) {
      }
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
            const token = localStorage.getItem('token');
            await axios.patch(`https://ceramic-shop-u8ak.onrender.com/api/v1/cart/items/${variantId || id}`, 
              { SoLuong: finalQty },
              { headers: { Authorization: `Bearer ${token}` }}
            );
          } catch (error) {
          }
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
  const shippingFee = selectedCartItems.length > 0 ? 30000 : 0; 
  const finalTotal = selectedCartItems.length > 0 ? totalCartPrice + shippingFee : 0;

  const handleCheckout = async (values) => {
    if (selectedCartItems.length === 0) {
      return message.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
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
        items: selectedCartItems.map(item => ({
          MaSanPham: item.id,
          MaBienThe: item.variantId || null,
          SoLuong: item.quantity,
          DonGia: item.price
        }))
      };

      await axios.post('https://ceramic-shop-u8ak.onrender.com/api/v1/orders', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await Promise.all(selectedCartItems.map(item => 
        axios.delete(`https://ceramic-shop-u8ak.onrender.com/api/v1/cart/items/${item.variantId || item.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ));

      message.success('Đặt hàng thành công!');
      
      setCart(prev => prev.filter(item => !selectedItems.includes(getItemKey(item))));
      setSelectedItems([]); 
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
        <div className={styles.logo} onClick={() => navigate('/landing')}>CERAMIC-SHOP</div>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} className={styles.btnBack}>
          Tiếp tục mua sắm
        </Button>
      </Header>

      <Content className={styles.mainContent}>
        <div className={styles.container}>
          <h2 className={styles.pageTitle}><ShoppingCartOutlined /> Giỏ Hàng Của Bạn</h2>
          
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
                          onChange={handleSelectAll}
                        >
                          <span style={{ fontWeight: 600 }}>Chọn tất cả ({cart.length})</span>
                        </Checkbox>
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />} 
                          onClick={handleDeleteSelected} 
                          disabled={selectedItems.length === 0}
                        >
                          Xóa mục đã chọn
                        </Button>
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
                  <h3 className={styles.summaryTitle}>Tóm tắt đơn hàng</h3>
                  <div style={{ marginBottom: '15px', fontStyle: 'italic', color: '#888', fontSize: '13px' }}>
                    (Đã chọn {selectedItems.length} sản phẩm)
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
                        disabled={selectedCartItems.length === 0}
                        block
                      >
                        TIẾN HÀNH ĐẶT HÀNG
                      </Button>
                    </Form>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </div>
      </Content>
    </Layout>
  );
}

export default Cart;