import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Input, Dropdown, Avatar, Space, Badge, Popover, Button, Spin, Row, Col, message, AutoComplete } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, SettingOutlined, LogoutOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import styles from './ProductDetail.module.css';

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

  const [userInfo, setUserInfo] = useState({ username: '', status: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // LOGIC GIỎ HÀNG
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('ceramic_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('ceramic_cart', JSON.stringify(cart));
  }, [cart]);

  const [searchKw, setSearchKw] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    let currentName = localStorage.getItem('name') || localStorage.getItem('username');
    let currentRole = localStorage.getItem('role') == '1' || localStorage.getItem('role') === 'admin' ? 'Quản trị viên' : 'Đang hoạt động';

    if (token) {
      try {
        const base64Url = token.split('.')[1];
        if (base64Url) {
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            const currentTime = Math.floor(Date.now() / 1000); 
            if (payload.exp && payload.exp < currentTime) {
                handleLogout();
                return;
            }
            if (!currentName) currentName = payload.name || payload.username;
            if (payload.role === 1 || payload.role === 'admin') currentRole = 'Quản trị viên';
            
            setIsLoggedIn(true);
            setUserInfo({ username: currentName || 'Khách hàng', status: currentRole });
        }
      } catch (error) { setIsLoggedIn(false); }
    } else {
      setIsLoggedIn(false);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3000/api/v1/products/${id}`);
        const data = res.data.result || res.data.data || res.data;
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
            const relRes = await axios.get(`http://localhost:3000/api/v1/products?category=${categoryObj.MaDanhMuc}&limit=5`);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUserInfo({ username: '', status: '' });
    navigate('/login');
    message.success("Đã đăng xuất");
  };

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

  const updateQty = (change) => {
    if (product?.TrangThai === 0) return;
    if (product?.BienTheSanPhams?.length > 0 && !selectedVariant) return message.warning("Vui lòng chọn phân loại!");
    let maxStock = selectedVariant ? selectedVariant.SoLuong : product.TongSoLuong;
    let newQty = currentQty + change;
    if (newQty < 1) newQty = 1;
    if (newQty > maxStock) { newQty = maxStock; message.info(`Chỉ còn ${maxStock} sản phẩm.`); }
    setCurrentQty(newQty);
  };

  const handleAddToCart = () => {
    if (product?.TrangThai === 0) return;
    if (product?.BienTheSanPhams?.length > 0 && !selectedVariant) return message.warning("Bạn chưa chọn phân loại hàng.");
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.MaSanPham && item.variantId === selectedVariant?.MaBienThe);
      if (existingItem) {
        return prevCart.map(item => 
          (item.id === product.MaSanPham && item.variantId === selectedVariant?.MaBienThe) 
          ? { ...item, quantity: item.quantity + currentQty } : item
        );
      }
      return [...prevCart, { 
        id: product.MaSanPham, 
        variantId: selectedVariant?.MaBienThe,
        name: selectedVariant ? `${product.TenSanPham} - ${selectedVariant.TenBienThe}` : product.TenSanPham, 
        price: selectedVariant ? selectedVariant.Gia : product.GiaThapNhat, 
        image: mainImage,
        quantity: currentQty 
      }];
    });
    message.success(`Đã thêm ${currentQty} sản phẩm vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    if (product?.TrangThai === 0) return;
    if (product?.BienTheSanPhams?.length > 0 && !selectedVariant) return message.warning("Bạn chưa chọn phân loại hàng.");
    handleAddToCart();
    navigate('/cart');
  };

  // --- CÁC HÀM XỬ LÝ MINI CART (Lấy từ Home, thêm variantId) ---
  const handleRemoveFromCart = (id, variantId) => {
    setCart(prevCart => prevCart.filter(item => !(item.id === id && item.variantId === variantId)));
  };

  const handleQtyChange = (id, variantId, value) => {
    if (value === '') return; 
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) return;
    setCart(prev => prev.map(item => (item.id === id && item.variantId === variantId) ? { ...item, quantity: num } : item));
  };

  const handleQtyBlur = (id, variantId, value) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
      setCart(prev => prev.map(item => (item.id === id && item.variantId === variantId) ? { ...item, quantity: 1 } : item));
    }
  };

  const increaseQty = (id, variantId) => {
    setCart(prev => prev.map(item => (item.id === id && item.variantId === variantId) ? { ...item, quantity: item.quantity + 1 } : item));
  };

  const decreaseQty = (id, variantId) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id && i.variantId === variantId);
      if (existing && existing.quantity > 1) return prev.map(i => (i.id === id && i.variantId === variantId) ? { ...i, quantity: i.quantity - 1 } : i);
      return prev.filter(i => !(i.id === id && i.variantId === variantId)); 
    });
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- GIAO DIỆN MINI CART (Đồng bộ 100% css từ Home) ---
  const miniCartContent = (
    <div className={styles.miniCartContainer}>
      <div className={styles.miniCartHeader}>Sản phẩm đã thêm</div>
      {cart.length === 0 ? (
        <div className={styles.emptyCart}>Giỏ hàng đang trống</div>
      ) : (
        <div className={styles.miniCartList}>
          {cart.map((item, index) => (
            <div key={`${item.id}-${item.variantId || index}`} className={styles.cartListItemCustom}>
              <div className={styles.cartItemAvatar}>
                <Avatar src={item.image} shape="square" className={styles.cartAvatar}/>
              </div>
              <div className={styles.cartItemInfo}>
                <span className={styles.miniCartName} title={item.name}>{item.name}</span>
                <div className={styles.miniCartQtyWrap}>
                  <span className={styles.miniCartPrice}>{formatPrice(item.price)}</span>
                  <div className={styles.qtyControls}>
                    <button className={styles.qtyBtn} onClick={() => decreaseQty(item.id, item.variantId)}>-</button>
                    <input 
                      type="number" 
                      min="1"
                      className={styles.qtyInput} 
                      value={item.quantity} 
                      onChange={(e) => handleQtyChange(item.id, item.variantId, e.target.value)} 
                      onBlur={(e) => handleQtyBlur(item.id, item.variantId, e.target.value)}
                    />
                    <button className={styles.qtyBtn} onClick={() => increaseQty(item.id, item.variantId)}>+</button>
                  </div>
                </div>
              </div>
              <div className={styles.cartItemAction}>
                <DeleteOutlined className={styles.cartDeleteIcon} onClick={() => handleRemoveFromCart(item.id, item.variantId)} />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className={styles.miniCartFooter}>
        <div className={styles.miniCartTotal}>Tổng: <span>{formatPrice(totalCartPrice)}</span></div>
        <Button type="primary" className={styles.btnCheckoutCart} onClick={() => navigate('/cart')}>
          XEM GIỎ HÀNG
        </Button>
      </div>
    </div>
  );

  const userMenu = [
    { key: '1', label: 'Sửa hồ sơ', icon: <SettingOutlined /> },
    { type: 'divider' },
    { key: '2', danger: true, label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: handleLogout },
  ];

  const handleSearchInput = async (value) => {
    setSearchKw(value);
    if (!value) { setSearchOptions([]); return; }
    try {
      const res = await axios.get(`http://localhost:3000/api/v1/products?search=${value}&searchField=TenSanPham&limit=5`);
      const data = res.data.data || res.data.result?.data || [];
      const options = data.map(item => ({
        value: item.TenSanPham,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => navigate(`/product/${item.MaSanPham}`)}>
            <img src={item.Thumbnail || 'https://via.placeholder.com/40'} alt={item.TenSanPham} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 500, color: '#1b437c' }}>{item.TenSanPham}</span>
              <span style={{ fontSize: 12, color: '#e74c3c', fontWeight: 'bold' }}>{formatPrice(item.GiaThapNhat)}</span>
            </div>
          </div>
        ),
      }));
      setSearchOptions(options);
    } catch (error) {}
  };

  const executeSearch = () => {
    navigate(`/?search=${searchKw}`);
    if (inputRef.current) inputRef.current.blur(); 
  };

  if (loading) return <div style={{textAlign: 'center', padding: '100px'}}><Spin size="large" /></div>;
  if (!product) return <div style={{textAlign: 'center', padding: '100px', color:'red'}}>Không tìm thấy sản phẩm!</div>;

  const isDiscontinued = product.TrangThai === 0;

  return (
    <Layout className={styles.homeWrapper}>
      <Helmet><title>{product.TenSanPham} | The Ceramic Shop</title></Helmet>
      
      <Header className={styles.topHeader}>
        <div className={styles.logo} onClick={() => navigate('/')} style={{cursor: 'pointer'}}>CERAMIC-SHOP</div>
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
          {isLoggedIn ? (
            <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow zIndex={9999}>
              <Space className={styles.userProfile}>
                <Avatar src="https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png" />
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
          <div className={styles.btnBackWrap}>
             <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} className={styles.btnBack}>Quay lại Cửa hàng</Button>
          </div>

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
                    <button className={styles.qtyBtn} onClick={() => updateQty(-1)} disabled={isDiscontinued}>-</button>
                    <input type="text" className={styles.qtyInput} value={currentQty} readOnly disabled={isDiscontinued}/>
                    <button className={styles.qtyBtn} onClick={() => updateQty(1)} disabled={isDiscontinued}>+</button>
                </div>
                <div className={styles.stockText}>
                    {product.BienTheSanPhams?.length > 0 && !selectedVariant ? 'Vui lòng chọn phân loại' : `Kho: ${selectedVariant ? selectedVariant.SoLuong : product.TongSoLuong}`}
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.btnAddCart} onClick={handleAddToCart} disabled={isDiscontinued}><ShoppingCartOutlined /> Thêm Giỏ Hàng</button>
                <button className={styles.btnBuyNow} onClick={handleBuyNow} disabled={isDiscontinued}>{isDiscontinued ? 'ĐÃ NGỪNG KINH DOANH' : 'MUA NGAY'}</button>
              </div>
            </div>
          </div>

          <div className={styles.sectionBox}>
            <h3 className={styles.sectionTitle}>Mô Tả Sản Phẩm</h3>
            <div className={styles.descContent}>{product.MoTa || 'Chưa có thông tin mô tả chi tiết.'}</div>
          </div>

          <div className={styles.sectionBox} style={{ marginTop: 30 }}>
            <h3 className={styles.sectionTitle}>Sản Phẩm Tương Tự</h3>
            {relatedProducts.length === 0 ? <p style={{color:'#888'}}>Chưa có sản phẩm cùng danh mục.</p> : (
              <Row gutter={[24, 24]}> 
                {relatedProducts.map(p => (
                    <Col xs={24} sm={12} md={8} lg={6} key={p.MaSanPham}>
                      <div className={styles.customCard} onClick={() => navigate(`/product/${p.MaSanPham}`)}>
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
    </Layout>
  );
}

export default ProductDetail;