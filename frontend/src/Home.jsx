import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Dropdown, Avatar, Space, Layout, Menu, Input, Select, Row, Col, Pagination, Spin, Badge, message, AutoComplete, Popover, Button, Radio } from 'antd';
import { LogoutOutlined, SettingOutlined, SearchOutlined, ShoppingCartOutlined, DeleteOutlined, ReloadOutlined, AppstoreOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styles from './Home.module.css';
import { useAutoLogout, clearSession } from './useAuth.js';

const { Header, Sider, Content } = Layout;

function Home() {
  useAutoLogout();

  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchKw, setSearchKw] = useState('');
  const [appliedSearchKw, setAppliedSearchKw] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  
  const inputRef = useRef(null);
  const [userInfo, setUserInfo] = useState({ username: '', avatar: '' });

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('customer_session_active') === 'true');
  const [isAuthChecking, setIsAuthChecking] = useState(localStorage.getItem('customer_session_active') === 'true');
  const [isFetchingCart, setIsFetchingCart] = useState(localStorage.getItem('customer_session_active') === 'true');
  
  const [cart, setCart] = useState(() => {
    if (localStorage.getItem('customer_session_active') === 'true') return [];
    const savedCart = localStorage.getItem('ceramic_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [openPopoverId, setOpenPopoverId] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [pendingAction, setPendingAction] = useState('cart');

  useEffect(() => {
    if (!isLoggedIn && !isAuthChecking) {
      localStorage.setItem('ceramic_cart', JSON.stringify(cart));
    }
  }, [cart, isLoggedIn, isAuthChecking]);

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

  const handleLogoutLocal = () => {
    clearSession(false); 
    localStorage.removeItem('customer_avatar');
    setIsLoggedIn(false);
    setUserInfo({ username: '', avatar: '' });
    const savedCart = localStorage.getItem('ceramic_cart');
    setCart(savedCart ? JSON.parse(savedCart) : []);
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (localStorage.getItem('customer_session_active') !== 'true') {
        setIsLoggedIn(false);
        setIsAuthChecking(false);
        setIsFetchingCart(false);
        return;
      }

      try {
        const res = await axios.get('https://ceramic-shop-u8ak.onrender.com/api/v1/auth/me', { 
          withCredentials: true 
        });
        const userData = res.data.user || res.data.result;
        
        if (userData.role === 'Admin' || userData.role === 'Staff') {
          setIsLoggedIn(false);
          const savedCart = localStorage.getItem('ceramic_cart');
          setCart(savedCart ? JSON.parse(savedCart) : []);
        } else {
          setIsLoggedIn(true);
          const profileData = userData?.profile || userData;
          const displayUsername = profileData?.TenKhachHang || userData?.username || 'Thành viên';
          
          let safeAvatar = profileData?.Avatar;
          if (!safeAvatar || safeAvatar.includes('default_avatar_gojcul')) {
            safeAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUsername)}&background=random&color=fff`;
          }

          setUserInfo({
            username: displayUsername,
            avatar: safeAvatar
          });
          await fetchCartFromDB();
        }
      } catch (error) {
        handleLogoutLocal();
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('https://ceramic-shop-u8ak.onrender.com/api/v1/auth/logout', {}, {
        withCredentials: true 
      });
    } catch (err) {
      console.error("Lỗi đăng xuất", err);
    }
    
    handleLogoutLocal();
    message.success("Đã đăng xuất tài khoản mua hàng");
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const keyword = searchParams.get('search');
    
    if (keyword) {
      setSearchKw(keyword);
      setAppliedSearchKw(keyword); 
      setSelectedCategory('all');
      setCurrentPage(1);
    }
  }, [location.search]);

  const userMenu = [
    { 
      key: '1', 
      label: 'Sửa hồ sơ', 
      icon: <SettingOutlined />,
      onClick: () => navigate('/profile') 
    },
    { type: 'divider' },
    { key: '2', danger: true, label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: handleLogout },
  ];

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  const processAddToCart = async (product, variant, action) => {
    const targetVariantId = variant.MaBienThe;
    const price = Number(variant.Gia || product.GiaThapNhat);
    let image = product.Thumbnail || 'https://via.placeholder.com/100';
    if (variant.HinhAnhBienThes?.length > 0) image = variant.HinhAnhBienThes[0].DuongDan;
    else if (variant.HinhAnhBienThe?.DuongDan) image = variant.HinhAnhBienThe.DuongDan;

    let fullName = product.TenSanPham;
    if (variant.TenBienThe && variant.TenBienThe.toLowerCase() !== 'mặc định') {
      fullName = `${product.TenSanPham} - ${variant.TenBienThe}`;
    }

    if (isLoggedIn) {
      try {
        await axios.post('https://ceramic-shop-u8ak.onrender.com/api/v1/cart/items', {
          MaBienThe: targetVariantId,
          SoLuong: 1
        },{
          withCredentials:true
        } );
        message.success('Đã thêm sản phẩm vào giỏ hàng!');
        fetchCartFromDB();
        if (action === 'buy') navigate('/cart');
      } catch (error) {
        message.error(error.response?.data?.message || 'Lỗi thêm sản phẩm!');
      }
    } else {
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.MaSanPham && item.variantId === targetVariantId);
        if (existingItem) {
          return prevCart.map(item => 
            (item.id === product.MaSanPham && item.variantId === targetVariantId) 
              ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prevCart, { 
          id: product.MaSanPham, 
          variantId: targetVariantId,
          name: fullName, 
          price: price, 
          image: image,
          quantity: 1,
          maxStock: variant.SoLuong
        }];
      });
      message.success('Đã thêm sản phẩm vào giỏ hàng!');
      if (action === 'buy') navigate('/cart');
    }
  };

  const handleProductAction = async (e, product, action) => {
    e.preventDefault();
    e.stopPropagation();
    
    const targetPopoverId = `${product.MaSanPham}-${action}`;
    if (openPopoverId === targetPopoverId) {
      setOpenPopoverId(null);
      return;
    }
    setOpenPopoverId(null);

    try {
      const res = await axios.get(`https://ceramic-shop-u8ak.onrender.com/api/v1/products/${product.MaSanPham}`);
      const prodData = res.data.result || res.data.data || res.data;
      
      let availableVariants = [];
      if (Array.isArray(prodData.BienTheSanPhams)) availableVariants = prodData.BienTheSanPhams;
      else if (Array.isArray(prodData.BienTheSanPham)) availableVariants = prodData.BienTheSanPham;
      else if (Array.isArray(prodData.variants)) availableVariants = prodData.variants;

      availableVariants = availableVariants.filter(v => v.TrangThai !== 0);

      if (availableVariants.length === 1) {
        processAddToCart(product, availableVariants[0], action);
      } else if (availableVariants.length > 1) {
        setVariants(availableVariants);
        setCurrentProduct(product);
        setPendingAction(action);
        
        const firstInStock = availableVariants.find(v => v.SoLuong > 0);
        setSelectedVariantId(firstInStock ? firstInStock.MaBienThe : availableVariants[0].MaBienThe);
        setOpenPopoverId(targetPopoverId);
      } else {
        navigate(`/product/${product.MaSanPham}`);
      }
    } catch (err) {
      console.error(err);
      navigate(`/product/${product.MaSanPham}`);
    }
  };

  const handleRemoveFromCart = async (id, variantId) => {
    setCart(prevCart => prevCart.filter(item => !(item.id === id && item.variantId === variantId)));
    if (isLoggedIn) {
      try {
        await axios.delete(`https://ceramic-shop-u8ak.onrender.com/api/v1/cart/items/${variantId || id}`, {
          withCredentials: true
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const updateQty = async (id, variantId, change) => {
    const itemToUpdate = cart.find(item => item.id === id && item.variantId === variantId);
    if (!itemToUpdate) return;
    
    let newQty = itemToUpdate.quantity + change;
    
    if (newQty < 1) {
       if (change === -1 && itemToUpdate.quantity === 1) {
          handleRemoveFromCart(id, variantId);
          return;
       }
       newQty = 1;
    }

    if (itemToUpdate.maxStock && newQty > itemToUpdate.maxStock) {
        newQty = itemToUpdate.maxStock;
        message.info(`Sản phẩm này chỉ còn ${itemToUpdate.maxStock} cái`);
    }

    setCart(prev => prev.map(item => (item.id === id && item.variantId === variantId) ? { ...item, quantity: newQty } : item));

    if (isLoggedIn) {
      try {
        await axios.patch(`https://ceramic-shop-u8ak.onrender.com/api/v1/cart/items/${variantId || id}`, 
          { SoLuong: newQty },
          { withCredentials: true}
        );
      } catch (error) {
        console.error(error);
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
            await axios.patch(`https://ceramic-shop-u8ak.onrender.com/api/v1/cart/items/${variantId || id}`, 
              { SoLuong: finalQty },
              { withCredentials: true }
            );
          } catch (error) {
            console.error(error);
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

  const totalCartPrice = isFetchingCart ? 0 : cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const miniCartContent = (
    <div className={styles.miniCartContainer}>
      <div className={styles.miniCartHeader}>Sản phẩm đã thêm</div>
      
      {isFetchingCart ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px 0' }}>
          <Spin size="small" />
          <span style={{ marginLeft: '10px', color: '#1b437c' }}>Đang đồng bộ dữ liệu...</span>
        </div>
      ) : cart.length === 0 ? (
        <div className={styles.emptyCart}>Giỏ hàng đang trống</div>
      ) : (
        <>
          <div className={styles.miniCartList}>
            {cart.map((item, index) => (
              <div key={`${item.id}-${item.variantId || index}`} className={styles.cartListItemCustom}>
                
                <div 
                  className={styles.cartItemAvatar}
                  onClick={() => navigate(`/product/${item.id}`)}
                  style={{ cursor: 'pointer' }}
                  title="Xem chi tiết sản phẩm"
                >
                  <Avatar src={item.image} shape="square" className={styles.cartAvatar}/>
                </div>

                <div className={styles.cartItemInfo}>
                  <span 
                    className={styles.miniCartName} 
                    title={item.name}
                    onClick={() => navigate(`/product/${item.id}`)}
                    style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#1b437c'}
                    onMouseLeave={(e) => e.target.style.color = '#333'}
                  >
                    {item.name}
                  </span>
                  
                  <div className={styles.miniCartQtyWrap}>
                    <span className={styles.miniCartPrice}>{formatPrice(item.price)}</span>
                    <div className={styles.qtyControls}>
                      <button className={styles.qtyBtn} onClick={() => updateQty(item.id, item.variantId, -1)}>-</button>
                      <input 
                        type="number" min="1"
                        className={styles.qtyInput} 
                        value={item.quantity} 
                        onChange={(e) => handleQtyChange(item.id, item.variantId, e.target.value)} 
                        onBlur={(e) => handleQtyBlur(item.id, item.variantId, e.target.value)}
                      />
                      <button className={styles.qtyBtn} onClick={() => updateQty(item.id, item.variantId, 1)}>+</button>
                    </div>
                  </div>
                </div>
                <div className={styles.cartItemAction}>
                  <DeleteOutlined className={styles.cartDeleteIcon} onClick={() => handleRemoveFromCart(item.id, item.variantId)} />
                </div>
              </div>
            ))}
          </div>
          <div className={styles.miniCartFooter}>
            <div className={styles.miniCartTotal}>Tổng: <span>{formatPrice(totalCartPrice)}</span></div>
            <Button type="primary" className={styles.btnCheckoutCart} onClick={() => navigate('/cart')}>
              XEM GIỎ HÀNG
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const renderVariantPopoverContent = () => (
    <div 
      style={{ minWidth: '280px', fontFamily: "'Arsenal', sans-serif", cursor: 'default' }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <style>
        {`
          .custom-variant-radio {
            display: flex !important; 
            width: 100%; 
            align-items: center; 
            padding: 10px 12px; 
            margin: 0; 
            border-radius: 6px; 
            border: 1px solid transparent;
            transition: all 0.2s ease;
          }
          .custom-variant-radio > span:last-child {
            flex: 1;
            width: 100%;
            display: flex;
          }
          .custom-variant-radio:hover:not(.ant-radio-wrapper-disabled) {
            background-color: #f0f5ff;
          }
          .custom-variant-radio.selected {
            background-color: #f0f5ff;
            border-color: #91caff;
          }
          .custom-popover-btn-cancel {
            border-radius: 4px !important;
            transition: all 0.3s !important;
            border: 1px solid #d9d9d9 !important;
            color: #333 !important;
            background: #fff !important;
          }
          .custom-popover-btn-cancel:hover {
            color: #e74c3c !important;
            border-color: #e74c3c !important;
            background: #fff !important;
          }
          .custom-popover-btn-submit {
            background-color: #1b437c !important;
            border-color: #1b437c !important;
            border-radius: 4px !important;
            color: white !important;
            transition: all 0.3s !important;
          }
          .custom-popover-btn-submit:hover:not(:disabled) {
            background-color: #13325c !important;
            border-color: #13325c !important;
            transform: translateY(-1px);
          }
        `}
      </style>
      
      <div style={{ fontWeight: 700, color: '#1b437c', marginBottom: '12px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Chọn phân loại:
      </div>
      <Radio.Group onChange={(e) => setSelectedVariantId(e.target.value)} value={selectedVariantId} style={{ width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          {variants.map(v => {
            const isSelected = selectedVariantId === v.MaBienThe;
            return (
              <Radio 
                key={v.MaBienThe} 
                value={v.MaBienThe} 
                disabled={v.SoLuong <= 0} 
                className={`custom-variant-radio ${isSelected ? 'selected' : ''}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flex: 1 }}>
                  <span style={{ fontSize: '14px', color: '#333', textAlign: 'left' }}>{v.TenBienThe}</span> 
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <span style={{ color: '#d0021b', fontWeight: 700, marginLeft: '8px' }}>
                      {formatPrice(v.Gia || currentProduct?.GiaThapNhat)}
                    </span> 
                    {v.SoLuong <= 0 && <span style={{ color: '#888', marginLeft: '4px', fontSize: '12px', fontStyle: 'italic' }}>(Hết)</span>}
                  </div>
                </div>
              </Radio>
            );
          })}
        </div>
      </Radio.Group>
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
        <Button 
          size="small" 
          className="custom-popover-btn-cancel"
          onClick={(e) => { 
            e.stopPropagation(); 
            setOpenPopoverId(null); 
          }}
        >
          Hủy
        </Button>
        <Button 
          size="small" 
          className="custom-popover-btn-submit"
          disabled={!selectedVariantId} 
          onClick={(e) => {
            e.stopPropagation();
            const variant = variants.find(v => v.MaBienThe === selectedVariantId);
            if (variant) {
              processAddToCart(currentProduct, variant, pendingAction);
              setOpenPopoverId(null);
            }
          }}
        >
          {pendingAction === 'buy' ? "Mua ngay" : "Thêm vào giỏ"}
        </Button>
      </div>
    </div>
  );

  const handleSearchInput = async (value) => {
    setSearchKw(value);
    if (!value) { setSearchOptions([]); return; }
    try {
      const res = await axios.get(`https://ceramic-shop-u8ak.onrender.com/api/v1/products?limit=1000`);
      let data = res.data.data || res.data.result?.data || [];
      
      const searchLower = value.toLowerCase();
      
      data = data.filter(item => {
        const matchName = item.TenSanPham?.toLowerCase().includes(searchLower);
        const matchCat = item.DanhMuc?.TenDanhMuc?.toLowerCase().includes(searchLower);
        return matchName || matchCat;
      });

      const options = data.slice(0, 10).map(item => ({
        value: item.TenSanPham, 
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} onClick={(e) => { e.stopPropagation(); navigate(`/product/${item.MaSanPham}`); }}>
            <img src={item.Thumbnail || 'https://via.placeholder.com/40'} alt={item.TenSanPham} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 500, color: '#1b437c' }}>{item.TenSanPham}</span>
              <span style={{ fontSize: 12, color: '#e74c3c', fontWeight: 'bold' }}>{formatPrice(item.GiaThapNhat)}</span>
            </div>
          </div>
        ),
      }));
      setSearchOptions(options);
    } catch (error) {
      console.error(error);
      setSearchOptions([]);
    }
  };

  const executeSearch = () => {
    setSortField(''); 
    setSortOrder(''); 
    setSelectedCategory('all');

    setAppliedSearchKw(searchKw); 
    setCurrentPage(1);
    setSearchOptions([]); 
    navigate(location.pathname);
    if (inputRef.current) inputRef.current.blur(); 
  };

  const handleSortFieldChange = (val) => {
    setSortField(val);
    if (val === 'Gia') setSortOrder('ASC'); 
    else if (val === 'MaSanPham') setSortOrder('DESC');
    else setSortOrder('');
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSortField(''); setSortOrder(''); setSearchKw(''); setAppliedSearchKw(''); setSelectedCategory('all'); setSearchOptions([]); setCurrentPage(1);
    navigate(location.pathname); 
  };

  const handleMenuClick = (e) => {
    setSortField(''); setSortOrder(''); setSearchKw(''); setAppliedSearchKw(''); setSearchOptions([]); setSelectedCategory(e.key); setCurrentPage(1);
    navigate(location.pathname); 
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('https://ceramic-shop-u8ak.onrender.com/api/v1/categories');
        const catData = res.data.result || [];
        
        const menuItems = [ { key: 'all', icon: <AppstoreOutlined />, label: 'Tất cả sản phẩm', className: styles.allProductsMenu } ];

        const parents = catData.filter(c => !c.ParentID);

        parents.forEach(p => {
           const mappedChildren = catData.filter(c => c.ParentID === p.MaDanhMuc);
           
           if (mappedChildren.length > 0) {
               menuItems.push({
                   type: 'group',
                   label: p.TenDanhMuc,
                   children: mappedChildren.map(c => ({
                       key: c.MaDanhMuc.toString(),
                       label: c.TenDanhMuc,
                   }))
               });
           } else {
               menuItems.push({
                   key: p.MaDanhMuc.toString(),
                   label: p.TenDanhMuc,
               });
           }
        });
        
        setCategories(menuItems);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage, limit: 12 };
        if (sortField) params.sort = sortField;
        if (sortOrder) params.order = sortOrder;
        
        if (selectedCategory && selectedCategory !== 'all' && !appliedSearchKw) { 
          params.category = selectedCategory; 
        }
        
        if (appliedSearchKw) {
          delete params.search;
          delete params.searchField;
          params.limit = 1000; 
          params.page = 1; 
        }

        const res = await axios.get('https://ceramic-shop-u8ak.onrender.com/api/v1/products', { params });
        const data = res.data;
        let fetchedList = data.data || data.result?.data || [];
        
        if (appliedSearchKw) {
          const kw = appliedSearchKw.toLowerCase();
          
          fetchedList = fetchedList.filter(p => {
            const matchName = p.TenSanPham?.toLowerCase().includes(kw);
            const matchCat = p.DanhMuc?.TenDanhMuc?.toLowerCase().includes(kw);
            return matchName || matchCat;
          });

          setTotalPages(Math.ceil(fetchedList.length / 12) || 1);
          const startIndex = (currentPage - 1) * 12;
          fetchedList = fetchedList.slice(startIndex, startIndex + 12);
        } else {
          setTotalPages(data.totalPages || data.result?.totalPages || 1);
        }

        setProducts(fetchedList);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally { setLoading(false); }
    };
    fetchProducts();
  }, [currentPage, selectedCategory, sortField, sortOrder, appliedSearchKw]); 

  return (
    <Layout className={styles.homeWrapper}>
      <Helmet>
        <title>Trang chủ | The Ceramic Shop</title>
      </Helmet>

      <Header className={styles.topHeader}>
        <div className={styles.logo} onClick={() => navigate('/landing')}>
          <img 
            src="/logo.png" 
            alt="Ceramic Shop Logo" 
            className={styles.logoImg} 
          />
          <div className={styles.logoTextWrap}>
              <span className={styles.logoText}>CERAMIC-SHOP</span>
              <span className={styles.logoSub}>TINH HOA GỐM SỨ VIỆT</span>
          </div>
        </div>
        
        <div className={styles.headerSearch}>
          <div className={styles.searchWrapper}>
            <AutoComplete
              className={styles.searchAutoComplete}
              options={searchKw ? searchOptions : []}
              onSelect={(val) => { 
                setSortField(''); 
                setSortOrder(''); 
                setSelectedCategory('all');
                
                setSearchKw(val); 
                setAppliedSearchKw(val); 
                setCurrentPage(1); 
                setSearchOptions([]); 
              }}
              onChange={handleSearchInput}
              value={searchKw}
              notFoundContent={null}
            >
              <Input 
                ref={inputRef}
                placeholder="Tìm kiếm ấm trà, bình hoa..." 
                className={styles.searchInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    executeSearch(); 
                  }
                }}
                suffix={ <SearchOutlined style={{ color: '#1b437c', cursor: 'pointer', fontSize: '18px', paddingRight: '8px' }} onClick={executeSearch} /> }
              />
            </AutoComplete>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Popover content={miniCartContent} placement="bottomRight" trigger="hover" overlayClassName={styles.cartPopover}>
            <Badge 
              count={cart.reduce((sum, item) => sum + item.quantity, 0)} 
              style={{ backgroundColor: '#e74c3c' }} 
              offset={[-5, 5]}
            >
              <ShoppingCartOutlined className={styles.cartIcon} onClick={() => navigate('/cart')}/>
            </Badge>
          </Popover>
          
          {isAuthChecking ? (
             <Space size="middle" style={{ opacity: 0.5 }}>
               <Avatar icon={<UserOutlined />} />
             </Space>
          ) : isLoggedIn ? (
            <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow>
              <Space className={styles.userProfile} style={{ cursor: 'pointer' }}>
                <Avatar src={userInfo.avatar || null} icon={!userInfo.avatar && <UserOutlined />} />
                <div className={styles.userInfoBox}>
                  <span className={styles.userName}>{userInfo.username}</span>
                </div>
              </Space>
            </Dropdown>
          ) : (
            <div className={styles.authButtons}>
              <button className={styles.btnOutline} onClick={() => navigate('/register')}>
                Đăng ký
              </button>
              <button className={styles.btnSolid} onClick={() => navigate('/login')}>
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      </Header>

      <Layout className={styles.mainContainer}>
        <Sider width={260} className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarLine}></div>
            <h2 className={styles.sidebarTitle}>Gốm Sứ Tinh Hoa</h2>
            <div className={styles.sidebarLine}></div>
          </div>
          <Menu mode="inline" selectedKeys={[selectedCategory]} onClick={handleMenuClick} items={categories} className={styles.customMenu} />
        </Sider>

        <Content className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <h2 className={styles.sectionTitle}>
              {appliedSearchKw ? `KẾT QUẢ CHO: "${appliedSearchKw}"` : 'SẢN PHẨM NỔI BẬT'}
            </h2>
            
            <div className={styles.sortTools}>
              <Select 
                value={sortField} 
                className={styles.filterSelect} 
                onChange={handleSortFieldChange}
                options={[
                  { value: '', label: 'Tiêu chí (Tất cả)' },
                  { value: 'MaSanPham', label: 'Theo ngày' },
                  { value: 'Gia', label: 'Theo Giá' }
                ]}
              />

              <Select 
                value={sortOrder} 
                className={styles.filterSelect} 
                onChange={(val) => {setSortOrder(val); setCurrentPage(1);}} 
                disabled={!sortField}
                options={
                  sortField === 'Gia' 
                    ? [
                        { value: 'ASC', label: 'Thấp đến cao' },
                        { value: 'DESC', label: 'Cao đến thấp' }
                      ] 
                    : sortField === 'MaSanPham'
                    ? [
                        { value: 'DESC', label: 'Gần đây nhất' },
                        { value: 'ASC', label: 'Cũ nhất' }
                      ]
                    : []
                }
              />

              <Button icon={<ReloadOutlined />} onClick={handleResetFilters} className={styles.resetBtn}>
                Xóa lọc
              </Button>
            </div>
          </div>

          <div style={{ overflowX: 'hidden', padding: '0 10px' }}>
            <Spin spinning={loading} description="Đang tải dữ liệu...">
              {products.length === 0 && !loading ? (
                 <div className={styles.emptyState}>Không tìm thấy sản phẩm nào.</div>
              ) : (
                <Row gutter={[24, 24]}> 
                  {products.map((p) => {
                    const isSoldOut = p.TongSoLuong <= 0;
                    const isDiscontinued = p.TrangThai === 0;
                    const imgUrl = p.Thumbnail || 'https://via.placeholder.com/300x300?text=No+Image';

                    return (
                      <Col xs={24} sm={12} md={12} lg={8} key={p.MaSanPham}>
                        <Badge.Ribbon 
                          text={isDiscontinued ? 'Ngừng bán' : 'Hết hàng'} 
                          color={isDiscontinued ? 'red' : 'gray'} 
                          style={{ display: (isSoldOut || isDiscontinued) ? 'block' : 'none' }}
                        >
                          <div className={`${styles.customCard} ${isDiscontinued ? styles.disabledCard : ''}`}>
                            <div 
                              style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: isDiscontinued ? 'not-allowed' : 'pointer' }}
                              onClick={() => {
                                if (!isDiscontinued) navigate(`/product/${p.MaSanPham}`);
                              }}
                            >
                              <div className={styles.cardImgWrapper}>
                                <img alt={p.TenSanPham} src={imgUrl} />
                                
                                <span className={styles.viewCount} title="Lượt xem">
                                  <EyeOutlined /> {p.LuotXem || 0}
                                </span>
                              </div>

                              <div className={styles.catTag}>{p.DanhMuc?.TenDanhMuc || 'Chưa phân loại'}</div>

                              <h3 className={styles.productName} title={p.TenSanPham}>{p.TenSanPham}</h3>
                              <div className={styles.productPrice}>{formatPrice(p.GiaThapNhat)}</div>
                            </div>

                            <div className={styles.cardButtons}>
                              <Popover
                                styles={{ body: { padding: '16px', borderRadius: '12px', minWidth: '280px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)', border: '1px solid #f0f0f0' } }}
                                content={currentProduct?.MaSanPham === p.MaSanPham && pendingAction === 'buy' ? renderVariantPopoverContent() : null}
                                open={openPopoverId === `${p.MaSanPham}-buy`}
                                onOpenChange={(visible) => { if (!visible) setOpenPopoverId(null); }}
                                placement="top"
                                trigger="click"
                                destroyOnHidden
                              >
                                <button 
                                  className={styles.btnBuy} 
                                  disabled={isDiscontinued || isSoldOut}
                                  onClick={(e) => handleProductAction(e, p, 'buy')}
                                >
                                  MUA NGAY
                                </button>
                              </Popover>

                              <Popover
                                styles={{ body: { padding: '16px', borderRadius: '12px', minWidth: '280px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)', border: '1px solid #f0f0f0' } }}
                                content={currentProduct?.MaSanPham === p.MaSanPham && pendingAction === 'cart' ? renderVariantPopoverContent() : null}
                                open={openPopoverId === `${p.MaSanPham}-cart`}
                                onOpenChange={(visible) => { if (!visible) setOpenPopoverId(null); }}
                                placement="top"
                                trigger="click"
                                destroyOnHidden
                              >
                                <button 
                                  className={styles.btnAddToCartIcon} 
                                  disabled={isDiscontinued || isSoldOut}
                                  onClick={(e) => handleProductAction(e, p, 'cart')}
                                  title="Thêm vào giỏ hàng"
                                >
                                  <ShoppingCartOutlined /> <span style={{fontSize: '12px', marginLeft: '2px', fontWeight: 'bold'}}>+</span>
                                </button>
                              </Popover>
                              
                              <button 
                                className={styles.btnDetail} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/product/${p.MaSanPham}`);
                                }}
                              >
                                CHI TIẾT
                              </button>
                            </div>
                          </div>
                        </Badge.Ribbon>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Spin>
          </div>

          {totalPages > 1 && (
            <div className={styles.paginationBox}>
              <Pagination current={currentPage} total={totalPages * 10} onChange={(page) => setCurrentPage(page)} showSizeChanger={false} />
            </div>
          )}
        </Content>
      </Layout>

      <footer className={styles.footer}>
          <div className={styles.container}>
              <div className={styles.footerGrid}>
                  <div className={styles.footerCol}>
                      <h3>HỖ TRỢ KHÁCH HÀNG</h3>
                      <ul>
                          <li><a href="#guide">Hướng dẫn mua hàng</a></li>
                          <li><a href="#payment">Chính sách thanh toán</a></li>
                          <li><a href="#shipping">Chính sách giao hàng</a></li>
                          <li><a href="#return">Chính sách đổi trả</a></li>
                          <li><a href="#warranty">Chính sách bảo hành</a></li>
                      </ul>
                  </div>
                  
                  <div className={styles.footerCol}>
                      <h3>PHƯƠNG THỨC THANH TOÁN</h3>
                      <ul>
                          <li>💵 Thanh toán COD (Tiền mặt)</li>
                          <li>🏦 VNPay (Quét mã QR)</li>
                          <li>📱 Ví điện tử (MoMo / ZaloPay)</li>
                          <li>🔗 Tiền điện tử (MetaMask)</li>
                          <li>💳 Chuyển khoản ngân hàng</li>
                      </ul>
                  </div>

                  <div className={styles.footerCol}>
                      <h3>THÔNG TIN LIÊN HỆ</h3>
                      <ul>
                          <li>📍 Địa chỉ: 484 Lạch Tray, Lê Chân, Hải Phòng</li>
                          <li>📞 Hotline: 0329.835.725</li>
                          <li>✉️ Email: theceramicshop24@gmail.com</li>
                          <li>🕐 Giờ làm việc: 8:00 - 22:00 (Thứ 2 - Thứ 7)</li>
                      </ul>
                  </div>

                  <div className={styles.footerCol}>
                      <h3>ĐĂNG KÝ NHẬN TIN</h3>
                      <p className={styles.footerText}>Nhận thông tin về sản phẩm mới và các chương trình khuyến mãi.</p>
                      <div className={styles.subscribeBox}>
                          <input type="email" placeholder="Nhập email của bạn..." />
                          <button>ĐĂNG KÝ</button>
                      </div>
                  </div>
              </div>
          </div>
          <div className={styles.copyright}>
              <p>© 2026 Bản quyền thuộc về CeramicShop. Bảo lưu mọi quyền.</p>
          </div>
      </footer>
    </Layout>
  );
}

export default Home;