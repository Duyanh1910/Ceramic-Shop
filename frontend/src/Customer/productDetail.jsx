import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Input, Dropdown, Avatar, Space, Badge, Popover, Button, Spin, Row, Col, message, AutoComplete, Rate } from 'antd';
import {
  SearchOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  DeleteOutlined,
  WalletOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { Helmet } from 'react-helmet-async';
import styles from './productDetail.module.css';
import { clearSession } from '../Utility/useAuth.js';
import Breadcrumb from '../Utility/Breadcrumb.jsx';
import ProductReview from './ProductReview.jsx';
import Footer from '../Utility/Footer';
import ProductTrace from '../Utility/ProductTrace.jsx';
const { Header, Content } = Layout;

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentQty, setCurrentQty] = useState(1);
  const [mainImage, setMainImage] = useState('');
  const [allImages, setAllImages] = useState([]);

  const imgContainerRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, containerW: 0, containerH: 0 });
  const [showLens, setShowLens] = useState(false);
  const [zoomScale, setZoomScale] = useState(2);

  const [userInfo, setUserInfo] = useState({ username: '', avatar: '' });
  
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('customer_session_active') === 'true');
  const [isAuthChecking, setIsAuthChecking] = useState(localStorage.getItem('customer_session_active') === 'true');
  const [isFetchingCart, setIsFetchingCart] = useState(localStorage.getItem('customer_session_active') === 'true');
  
  const [cart, setCart] = useState(() => {
    if (localStorage.getItem('customer_session_active') === 'true') return [];
    const savedCart = localStorage.getItem('ceramic_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [searchKw, setSearchKw] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const inputRef = useRef(null);

  const [ratingStats, setRatingStats] = useState({ avg: 0, total: 0 });

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
          categoryId: item.BienTheSanPham.SanPham?.MaDanhMuc,
          MaDanhMuc: item.BienTheSanPham.SanPham?.MaDanhMuc,
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
  }, [navigate]);

  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`https://ceramic-shop-u8ak.onrender.com/api/v1/products/${id}`);
        const data = res.data.result || res.data.data || res.data;
        if (!data?.MaSanPham) {
          console.warn('[ProductDetail] Không tìm thấy MaSanPham trong response:', res.data);
        }
        setProduct(data);
        
        let images = [];
        if (data.BienTheSanPhams) {
            data.BienTheSanPhams.forEach(v => {
                if (v.HinhAnhBienThes) {
                    v.HinhAnhBienThes.forEach(img => {
                        if (!images.find(i => i.src === img.DuongDan)) {
                            images.push({ src: img.DuongDan, variantId: v.MaBienThe });
                        }
                    });
                }
            });
        }
        if (images.length === 0) images.push({ src: data.Thumbnail || 'https://via.placeholder.com/600?text=No+Image', variantId: null });
        setAllImages(images);
        setMainImage(images[0].src);

        const categoryObj = data.DanhMuc || data.DanhMucSanPham;
        if(categoryObj && categoryObj.MaDanhMuc) {
            const relRes = await axios.get(`https://ceramic-shop-u8ak.onrender.com/api/v1/products?category=${categoryObj.MaDanhMuc}&limit=5`);
            let relData = relRes.data.data || (relRes.data.result && relRes.data.result.data) || [];
            relData = relData.filter(p => p.MaSanPham !== data.MaSanPham).slice(0, 4);
            setRelatedProducts(relData);
        }
      } catch (error) {
        message.error("Không tìm thấy sản phẩm!");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProductDetail();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const resRating = await axios.get(`https://ceramic-shop-u8ak.onrender.com/api/v1/reviews/${id}/ratings`);

      if (resRating.data.success) {
        const ratingData = resRating.data.result;
        setRatingStats({
          avg: parseFloat(ratingData?.DiemTrungBinh) || 0,
          total: parseInt(ratingData?.TongDanhGia) || 0
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu đánh giá:", error);
    }
  };

  useEffect(() => {
    if (id) fetchReviews();
  }, [id]);

  useEffect(() => {
    const box = imgContainerRef.current;
    const handleWheel = (e) => {
        e.preventDefault(); 
        setZoomScale(prev => Math.min(Math.max(1.5, prev + (-e.deltaY * 0.002)), 5)); 
    };
    if (box) {
        box.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
        if (box) box.removeEventListener('wheel', handleWheel);
    };
  }, [showLens]);

  const handleMouseMoveZoom = (e) => {
    if (!imgContainerRef.current) return;
    const { left, top, width, height } = imgContainerRef.current.getBoundingClientRect();
    setCursorPos({
        x: Math.max(0, Math.min(e.clientX - left, width)),
        y: Math.max(0, Math.min(e.clientY - top, height)),
        containerW: width,
        containerH: height
    });
    if (!showLens) setShowLens(true);
  };

  const LENS_SIZE = 150;
  const lensX = cursorPos.x - LENS_SIZE / 2;
  const lensY = cursorPos.y - LENS_SIZE / 2;
  const bgX = -(cursorPos.x * zoomScale - LENS_SIZE / 2);
  const bgY = -(cursorPos.y * zoomScale - LENS_SIZE / 2);
  const bgSizeW = cursorPos.containerW * zoomScale;
  const bgSizeH = cursorPos.containerH * zoomScale;

  const handleLogout = async () => {
    try {
      await axios.post('https://ceramic-shop-u8ak.onrender.com/api/v1/auth/logout', {}, {
        withCredentials: true 
      });
    } catch (err) {}
    handleLogoutLocal();
    message.success("Đã đăng xuất");
    navigate('/login');
  };

  const userMenu = [
  {
    key: "profile",
    label: "Tài khoản",
    icon: <UserOutlined />,
    onClick: () => navigate("/profile"),
  },
  {
    key: "vouchers",
    label: "Ví của tôi",
    icon: <WalletOutlined />,
    onClick: () => navigate("/vouchers"),
  },
  {
    key: "orders",
    label: "Đơn hàng của tôi",
    icon: <ShoppingOutlined />,
    onClick: () => navigate("/orders"),
  },
  {
    key: "warranties",
    label: "Bảo hành của tôi",
    icon: <SafetyCertificateOutlined />,
    onClick: () => navigate("/warranties"),
  },
  {
    key: "returns",
    label: "Đổi trả của tôi",
    icon: <SwapOutlined />,
    onClick: () => navigate("/returns"),
  },
  {
    key: "logout",
    danger: true,
    label: "Đăng xuất",
    icon: <LogoutOutlined />,
    onClick: handleLogout,
  },
];

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  const getPriceDisplay = () => {
    if (!product) return 'Đang cập nhật...';
    const variants = product.BienTheSanPhams || [];
    if (variants.length > 0) {
        const prices = variants.map(v => Number(v.Gia));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        return minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    }
    return formatPrice(product.GiaThapNhat);
  };

  const handleVariantClick = (v) => {
    if (product?.TrangThai === 0 || v.SoLuong <= 0) return;
    setSelectedVariant(v);
    setCurrentQty(1);
    if (v.HinhAnhBienThes?.length > 0) {
        setMainImage(v.HinhAnhBienThes[0].DuongDan);
    }
  };

  const handleThumbClick = (img) => {
    setMainImage(img.src);
    if (img.variantId && (!selectedVariant || selectedVariant.MaBienThe !== img.variantId)) {
        const targetVariant = product.BienTheSanPhams?.find(v => v.MaBienThe === img.variantId);
        if (targetVariant && targetVariant.SoLuong > 0 && product.TrangThai !== 0) {
            setSelectedVariant(targetVariant);
            setCurrentQty(1);
        }
    }
  };

  const updateQtyLocal = (change) => {
    if (product?.TrangThai === 0) return;
    if (product?.BienTheSanPhams?.length > 0 && !selectedVariant) return message.warning("Vui lòng chọn phân loại!");
    let maxStock = selectedVariant ? selectedVariant.SoLuong : product.TongSoLuong;
    let newQty = currentQty + change;
    if (newQty < 1) newQty = 1;
    if (newQty > maxStock) { newQty = maxStock; message.info(`Số lượng sản phẩm chỉ có tối đa ${maxStock} sản phẩm.`); }
    setCurrentQty(newQty);
  };

  const handleAddToCart = async () => {
    if (product?.TrangThai === 0) return false;
    if (product?.BienTheSanPhams?.length > 0 && !selectedVariant) {
      message.warning("Bạn chưa chọn phân loại hàng.");
      return false;
    }
    
    const targetVariantId = selectedVariant?.MaBienThe || null;

    if (isLoggedIn) {
      try {
        await axios.post('https://ceramic-shop-u8ak.onrender.com/api/v1/cart/items', {
          MaBienThe: targetVariantId,
          SoLuong: currentQty
        }, { withCredentials: true });
        
        message.success(`Đã thêm ${currentQty} sản phẩm vào giỏ hàng!`);
        await fetchCartFromDB(); 
        return true;
      } catch (error) {
        message.error(error.response?.data?.message || 'Lỗi thêm sản phẩm!');
        return false;
      }
    } else {
      let image = mainImage;
      let fullName = product.TenSanPham;
      if (selectedVariant && selectedVariant.TenBienThe.toLowerCase() !== 'mặc định') {
        fullName = `${product.TenSanPham} - ${selectedVariant.TenBienThe}`;
      }

      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.MaSanPham && item.variantId === targetVariantId);
        if (existingItem) {
          return prevCart.map(item => 
            (item.id === product.MaSanPham && item.variantId === targetVariantId) 
            ? { ...item, quantity: item.quantity + currentQty } : item
          );
        }
        return [...prevCart, { 
          id: product.MaSanPham, 
          variantId: targetVariantId,
          name: fullName, 
          price: selectedVariant ? selectedVariant.Gia : product.GiaThapNhat, 
          image: image,
          quantity: currentQty,
          categoryId: product.MaDanhMuc || product.DanhMuc?.MaDanhMuc || product.DanhMucSanPham?.MaDanhMuc,
          MaDanhMuc: product.MaDanhMuc || product.DanhMuc?.MaDanhMuc || product.DanhMucSanPham?.MaDanhMuc,
          maxStock: selectedVariant ? selectedVariant.SoLuong : product.TongSoLuong
        }];
      });
      message.success(`Đã thêm ${currentQty} sản phẩm vào giỏ hàng!`);
      return true;
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart();
    if (success) navigate('/cart');
  };

  const updateCartItemQty = async (id, variantId, change) => {
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
          { withCredentials: true }
        );
      } catch (error) {}
    }
  };

  const handleRemoveFromCart = async (id, variantId) => {
    setCart(prevCart => prevCart.filter(item => !(item.id === id && item.variantId === variantId)));
    if (isLoggedIn) {
      try {
        await axios.delete(`https://ceramic-shop-u8ak.onrender.com/api/v1/cart/items/${variantId || id}`, {
          withCredentials: true
        });
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

  const totalCartPrice = isFetchingCart ? 0 : cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCartItems = isFetchingCart ? 0 : cart.reduce((sum, item) => sum + item.quantity, 0);

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
                    <div className={styles.miniQtyControls}>
                      <button className={styles.miniQtyBtn} onClick={() => updateCartItemQty(item.id, item.variantId, -1)}>-</button>
                      <input 
                        type="number" min="1"
                        className={styles.miniQtyInput} 
                        value={item.quantity} 
                        onChange={(e) => handleQtyChange(item.id, item.variantId, e.target.value)} 
                        onBlur={(e) => handleQtyBlur(item.id, item.variantId, e.target.value)}
                      />
                      <button className={styles.miniQtyBtn} onClick={() => updateCartItemQty(item.id, item.variantId, 1)}>+</button>
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

    const handleSearchInput = async (value) => {
    setSearchKw(value);
    if (!value) { 
      setSearchOptions([]); 
      return; 
    }
    
  };
  useEffect(()=>{
      if(!searchKw){
        setSearchOptions([]);
        return;
      }
      const delayDebounceFn = setTimeout(async()=>{
        try {
          const res = await axios.get(`https://ceramic-shop-u8ak.onrender.com/api/v1/products?limit=1000`);
          let data = res.data.data || res.data.result?.data || [];
          
          const searchLower = searchKw.toLowerCase();
          
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
      },500);
      return () => clearTimeout(delayDebounceFn);
    },[searchKw,navigate])

  const executeSearch = () => {
    navigate(`/home?search=${searchKw}`);
    if (inputRef.current) inputRef.current.blur(); 
  };

  if (loading) return <div style={{textAlign: 'center', padding: '100px'}}><Spin size="large" /></div>;
  if (!product) return <div style={{textAlign: 'center', padding: '100px', color:'red'}}>Không tìm thấy sản phẩm!</div>;

  const isDiscontinued = product.TrangThai === 0;

  return (
    <Layout className={styles.homeWrapper}>
      <Helmet><title>{product.TenSanPham} | Ceramic Shop</title></Helmet>
      
      <Header className={styles.topHeader}>
        <div className={styles.logoBox} onClick={() => navigate('/home')}>
          <img 
            src="/logo.png" 
            alt="Ceramic Shop Logo" 
            className={styles.logoImg} 
          />
          <div className={styles.logoTextWrap}>
              <h1 className={styles.logoText}>CERAMIC-SHOP</h1>
              <span className={styles.logoSub}>TINH HOA GỐM SỨ VIỆT</span>
          </div>
        </div>

        <div className={styles.headerSearch}>
          <div className={styles.searchWrapper}>
            <AutoComplete className={styles.searchAutoComplete} options={searchOptions} onSearch={handleSearchInput} value={searchKw} defaultActiveFirstOption={false} backfill={false}>
              <Input ref={inputRef} placeholder="Tìm kiếm ấm trà, bình hoa..." className={styles.searchInput} onChange={(e) => setSearchKw(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') executeSearch(); }} suffix={<SearchOutlined style={{ color: '#1b437c', cursor: 'pointer', fontSize: '18px' }} onClick={executeSearch} />}/>
            </AutoComplete>
          </div>
        </div>
        <div className={styles.headerActions}>

          <Popover content={miniCartContent} placement="bottomRight" trigger="hover" overlayClassName={styles.cartPopover} zIndex={9999}>
            <Badge count={totalCartItems} style={{ backgroundColor: '#e74c3c' }} offset={[-5, 5]}>
              <ShoppingCartOutlined className={styles.cartIcon} onClick={() => navigate('/cart')}/>
            </Badge>
          </Popover>

          {isAuthChecking ? (
             <Space size="middle" style={{ opacity: 0.5 }}>
               <Avatar icon={<UserOutlined />} />
             </Space>
          ) : isLoggedIn ? (
            <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow zIndex={9999}>
              <Space className={styles.userProfile} style={{ cursor: 'pointer' }}>
                <Avatar src={userInfo.avatar || null} icon={!userInfo.avatar && <UserOutlined />} />
                <div className={styles.userInfoBox}><span className={styles.userName}>{userInfo.username}</span></div>
              </Space>
            </Dropdown>
          ) : (
            <div className={styles.authButtons}>
              <button className={styles.btnOutline} onClick={() => navigate('/register')}>Đăng ký</button>
              <button className={styles.btnSolid} onClick={() => navigate('/login')}>Đăng nhập</button>
            </div>
          )}
        </div>
      </Header>

      <Layout className={styles.mainContainer}>
        <Content className={styles.mainContent}>
          <Breadcrumb customLabels={{ [id]: product?.TenSanPham }} />

          <div className={styles.productDetailBox}>
            <div className={styles.gallery}>
              <div
                className={styles.mainImgBox} 
                ref={imgContainerRef}
                onMouseMove={handleMouseMoveZoom} 
                onMouseLeave={() => setShowLens(false)}
                onMouseEnter={() => setShowLens(true)}
              >
                <img src={mainImage} alt="Main" className={styles.baseImage} />
                
                {showLens && (
                  <div 
                      className={styles.zoomLens}
                      style={{
                          left: lensX,
                          top: lensY,
                          backgroundImage: `url(${mainImage})`,
                          backgroundPosition: `${bgX}px ${bgY}px`,
                          backgroundSize: `${bgSizeW}px ${bgSizeH}px`
                      }}
                  >
                      <SearchOutlined className={styles.lensIcon} />
                  </div>
                )}
              </div>

              <div className={styles.thumbList}>
                {allImages.map((img, idx) => (
                  <div key={idx} className={`${styles.thumbItem} ${mainImage === img.src ? styles.activeThumb : ''}`} onClick={() => handleThumbClick(img)}>
                    <img src={img.src} alt="thumb" />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.info}>
              <h1 className={styles.title}>{product.TenSanPham}</h1>
              
              <div className={styles.detailRatingBox}>
                <Rate disabled allowHalf value={ratingStats.avg} className={styles.detailStars} />
                <span className={styles.detailRatingText}>
                  {ratingStats.avg} / 5
                </span>
                <span className={styles.detailRatingCount}>
                  ({ratingStats.total} đánh giá)
                </span>
              </div>

              <div className={styles.priceBox}>
                 <div className={styles.price}>{selectedVariant ? formatPrice(selectedVariant.Gia) : getPriceDisplay()}</div>
              </div>

              <div className={styles.flexRow}>
                <div className={styles.label}>Phân loại</div>
                <div className={styles.options}>
                    {product.BienTheSanPhams?.length > 0 ? product.BienTheSanPhams.map(v => (
                        <button 
                            key={v.MaBienThe}
                            className={`${styles.btnVariant} ${selectedVariant?.MaBienThe === v.MaBienThe ? styles.active : ''} ${v.SoLuong <= 0 || isDiscontinued ? styles.outOfStock : ''}`}
                            onClick={() => handleVariantClick(v)}
                            disabled={v.SoLuong <= 0 || isDiscontinued}
                        >
                            {v.TenBienThe} {v.SoLuong <= 0 && '(Hết)'}
                        </button>
                    )) : <span style={{color:'#888', paddingTop: '5px'}}>Mặc định</span>}
                </div>
              </div>

              <div className={styles.flexRow}>
                <div className={styles.label}>Số lượng</div>
                <div className={styles.qtyBox}>
                    <button className={styles.qtyBtn} onClick={() => updateQtyLocal(-1)} disabled={isDiscontinued}>-</button>
                    <input type="text" className={styles.qtyInput} value={currentQty} readOnly disabled={isDiscontinued}/>
                    <button className={styles.qtyBtn} onClick={() => updateQtyLocal(1)} disabled={isDiscontinued}>+</button>
                </div>
                <div className={styles.stockText}>
                    {product.BienTheSanPhams?.length > 0 && !selectedVariant ? 'Vui lòng chọn phân loại' : `Kho: ${selectedVariant ? selectedVariant.SoLuong : product.TongSoLuong}`}
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.btnAddCart} onClick={handleAddToCart} disabled={isDiscontinued}><ShoppingCartOutlined /> Thêm Giỏ Hàng</button>
                <button className={styles.btnBuyNow} onClick={handleBuyNow} disabled={isDiscontinued}>{isDiscontinued ? 'ĐÃ NGỪNG KINH DOANH' : 'MUA NGAY'}</button>
              </div>
                  {product.MaSanPham && (
                    <div style={{ marginTop: '20px', width: '100%' }}>
                      <ProductTrace
                        maSanPham={product.MaSanPham}
                        disabled={isDiscontinued}
                      />
                    </div>
                  )}
            </div>
          </div>

          <div className={styles.sectionBox}>
            <h3 className={styles.sectionTitle}>Mô Tả Sản Phẩm</h3>
            <div className={styles.descContent} dangerouslySetInnerHTML={{ __html: product.MoTa || 'Chưa có thông tin mô tả chi tiết.' }}></div>
          </div>

          <div className={styles.sectionBox} style={{ padding: 0, border: 'none', background: 'transparent' }}>
            <ProductReview productId={id} />
          </div>

          <div className={styles.sectionBox} style={{ marginTop: 30 }}>
            <h3 className={styles.sectionTitle}>Sản Phẩm Tương Tự</h3>
            {relatedProducts.length === 0 ? <p style={{color:'#888'}}>Chưa có sản phẩm cùng danh mục.</p> : (
              <Row gutter={[24, 24]}> 
                {relatedProducts.map(p => (
                    <Col xs={24} sm={12} md={8} lg={6} key={p.MaSanPham}>
                      <div className={styles.customCard} onClick={() => {
                          navigate(`/product/${p.MaSanPham}`);
                          window.scrollTo(0, 0);
                        }}>
                        <div className={styles.cardImgWrapper}><img alt={p.TenSanPham} src={p.Thumbnail || 'https://via.placeholder.com/300'} /></div>
                        <div className={styles.catTag}>{p.DanhMuc?.TenDanhMuc}</div>
                        <h3 className={styles.productName}>{p.TenSanPham}</h3>
                        <div className={styles.productPrice}>{formatPrice(p.GiaThapNhat)}</div>
                      </div>
                    </Col>
                ))}
              </Row>
            )}
          </div>
        </Content>
      </Layout>

      <Footer />
    </Layout>
  );
}

export default ProductDetail;
