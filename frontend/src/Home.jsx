import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dropdown, Avatar, Space, Layout, Menu, Input, Select, Row, Col, Pagination, Spin, Badge, message, AutoComplete, Popover, Button, List } from 'antd';
import { LogoutOutlined, SettingOutlined, SearchOutlined, ShoppingCartOutlined, DeleteOutlined, ReloadOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styles from './Home.module.css';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

function Home() {
  const navigate = useNavigate();
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
  const [userInfo, setUserInfo] = useState({ username: 'Khách hàng', status: 'Chưa đăng nhập' });

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    let currentRole = '';
    let currentName = storedUsername;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 1) currentRole = 'Quản trị viên';
        if (!currentName && payload.username) currentName = payload.username;
      } catch (error) {}
    }
    if (currentName) {
      setUserInfo({ username: currentName, status: currentRole });
    }
  }, []);

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('ceramic_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('ceramic_cart', JSON.stringify(cart));
  }, [cart]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const userMenu = [
    { key: '1', label: 'Sửa hồ sơ', icon: <SettingOutlined /> },
    { type: 'divider' },
    { key: '2', danger: true, label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: handleLogout },
  ];

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  const handleAddToCart = (e, product) => {
    e.stopPropagation(); 
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.MaSanPham);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.MaSanPham ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { 
        id: product.MaSanPham, 
        name: product.TenSanPham, 
        price: product.GiaThapNhat, 
        image: product.Thumbnail || 'https://via.placeholder.com/100',
        quantity: 1 
      }];
    });
    message.success('Đã thêm sản phẩm vào giỏ hàng!');
  };

  const handleRemoveFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const handleQtyChange = (id, value) => {
    if (value === '') return; 
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) return;
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: num } : item));
  };

  const handleQtyBlur = (id, value) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
      setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: 1 } : item));
    }
  };

  const increaseQty = (id) => setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
  const decreaseQty = (id) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantity > 1) return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      return prev.filter(i => i.id !== id); 
    });
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const miniCartContent = (
    <div className={styles.miniCartContainer}>
      <div className={styles.miniCartHeader}>Sản phẩm đã thêm</div>
      {cart.length === 0 ? (
        <div className={styles.emptyCart}>Giỏ hàng đang trống</div>
      ) : (
        <List
          className={styles.miniCartList}
          itemLayout="horizontal"
          dataSource={cart}
          renderItem={item => (
            <List.Item
              className={styles.cartListItem}
              actions={[<DeleteOutlined className={styles.cartDeleteIcon} onClick={() => handleRemoveFromCart(item.id)} />]}
            >
              <List.Item.Meta
                avatar={<Avatar src={item.image} shape="square" className={styles.cartAvatar}/>}
                title={<span className={styles.miniCartName} title={item.name}>{item.name}</span>}
                description={
                  <div className={styles.miniCartQtyWrap}>
                    <span className={styles.miniCartPrice}>{formatPrice(item.price)}</span>
                    <div className={styles.qtyControls}>
                      <button className={styles.qtyBtn} onClick={() => decreaseQty(item.id)}>-</button>
                      <input 
                        type="number" 
                        min="1"
                        className={styles.qtyInput} 
                        value={item.quantity} 
                        onChange={(e) => handleQtyChange(item.id, e.target.value)} 
                        onBlur={(e) => handleQtyBlur(item.id, e.target.value)}
                      />
                      <button className={styles.qtyBtn} onClick={() => increaseQty(item.id)}>+</button>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
      <div className={styles.miniCartFooter}>
        <div className={styles.miniCartTotal}>Tổng: <span>{formatPrice(totalCartPrice)}</span></div>
        <Button type="primary" className={styles.btnCheckoutCart} onClick={() => navigate('/cart')}>
          XEM GIỎ HÀNG
        </Button>
      </div>
    </div>
  );

  const handleSearchInput = async (value) => {
    setSearchKw(value);
    if (!value) {
      setSearchOptions([]);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:3000/api/v1/products?search=${value}&searchField=TenSanPham&limit=5`);
      const data = res.data.data || res.data.result?.data || [];
      const options = data.map(item => ({
        value: item.TenSanPham,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} onClick={(e) => { e.stopPropagation(); navigate(`/product/${item.MaSanPham}`); }}>
            <img src={item.Thumbnail || 'https://via.placeholder.com/40'} alt={item.TenSanPham} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 500, color: '#1b437c' }}>{item.TenSanPham}</span>
              <span style={{ fontSize: 12, color: '#1b437c', fontWeight: 'bold' }}>{formatPrice(item.GiaThapNhat)}</span>
            </div>
          </div>
        ),
      }));
      setSearchOptions(options);
    } catch (error) {
      setSearchOptions([]);
    }
  };

  const executeSearch = () => {
    setAppliedSearchKw(searchKw);
    setCurrentPage(1);
    setSearchOptions([]);
  };

  const handleSortFieldChange = (val) => {
    setSortField(val);
    if (val === 'Gia') setSortOrder('ASC'); 
    else if (val === 'MaSanPham') setSortOrder('DESC');
    else setSortOrder('');
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSortField('');
    setSortOrder('');
    setSearchKw('');
    setAppliedSearchKw('');
    setSelectedCategory('all');
    setSearchOptions([]);
    setCurrentPage(1);
  };

  const handleMenuClick = (e) => {
    setSortField('');
    setSortOrder('');
    setSearchKw('');
    setAppliedSearchKw('');
    setSearchOptions([]);
    setSelectedCategory(e.key);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/v1/categories');
        const catData = res.data.result || [];
        const mapChildToParent = { 1: [6, 7, 8], 2: [9], 3: [10, 11], 4: [12, 13], 5: [14, 15] };
        const parents = catData.filter(c => c.MaDanhMuc <= 5);
        const childrenList = catData.filter(c => c.MaDanhMuc > 5);
        const menuItems = [{ key: 'all', icon: <AppstoreOutlined />, label: 'Tất cả sản phẩm', className: styles.allProductsMenu }];
        parents.forEach(p => {
           const childIds = mapChildToParent[p.MaDanhMuc] || [];
           const mappedChildren = childrenList.filter(c => childIds.includes(c.MaDanhMuc));
           if (mappedChildren.length > 0) {
               menuItems.push({
                   type: 'group',
                   label: p.TenDanhMuc,
                   children: mappedChildren.map(c => ({
                       key: c.MaDanhMuc.toString(),
                       label: c.TenDanhMuc,
                   }))
               });
           }
        });
        setCategories(menuItems);
      } catch (error) {}
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage, limit: 9 };
        if (sortField) params.sort = sortField;
        if (sortOrder) params.order = sortOrder;
        if (appliedSearchKw) { params.search = appliedSearchKw; params.searchField = 'TenSanPham'; }
        if (selectedCategory && selectedCategory !== 'all') { params.category = selectedCategory; }
        const res = await axios.get('http://localhost:3000/api/v1/products', { params });
        const data = res.data;
        setProducts(data.data || data.result?.data || []);
        setTotalPages(data.totalPages || data.result?.totalPages || 1);
        setCurrentPage(data.page || data.result?.page || 1);
      } catch (error) {
        message.error('Lỗi khi tải sản phẩm!');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, selectedCategory, sortField, sortOrder, appliedSearchKw]); 

  return (
    <Layout className={styles.homeWrapper}>
      <Helmet><title>Trang chủ | The Ceramic Shop</title></Helmet>
      <Header className={styles.topHeader}>
        <div className={styles.logo}>CERAMIC-SHOP</div>
        <div className={styles.headerSearch}>
          <div className={styles.searchWrapper}>
            <AutoComplete
              className={styles.searchAutoComplete}
              options={searchKw ? searchOptions : []}
              onSearch={handleSearchInput}
              value={searchKw}
              popupClassName={styles.searchPopup}
              notFoundContent={null}
              defaultActiveFirstOption={false} 
              backfill={false}
            >
              <Input 
                placeholder="Tìm kiếm ấm trà, bình hoa..." 
                className={styles.searchInput}
                onChange={(e) => setSearchKw(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') executeSearch(); }}
                suffix={<SearchOutlined style={{ color: '#1b437c', cursor: 'pointer', fontSize: '18px' }} onClick={executeSearch} />}
              />
            </AutoComplete>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Popover content={miniCartContent} placement="bottomRight" trigger="hover" overlayClassName={styles.cartPopover}>
            <Badge count={totalCartItems} style={{ backgroundColor: '#ff0000' }} offset={[-5, 5]}>
              <ShoppingCartOutlined className={styles.cartIcon} onClick={() => navigate('/cart')}/>
            </Badge>
          </Popover>
          <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow>
            <Space className={styles.userProfile}>
              <Avatar src="https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png" />
              <div className={styles.userInfoBox}>
                <span className={styles.userName}>{userInfo.username}</span>
                <span className={styles.userStatus}>{userInfo.status}</span>
              </div>
            </Space>
          </Dropdown>
        </div>
      </Header>
      <Layout className={styles.mainContainer}>
        <Sider width={260} className={styles.sidebar}>
          <div className={styles.sidebarHeader}><div className={styles.sidebarLine}></div><h2 className={styles.sidebarTitle}>Gốm Sứ Tinh Hoa</h2><div className={styles.sidebarLine}></div></div>
          <Menu mode="inline" selectedKeys={[selectedCategory]} onClick={handleMenuClick} items={categories} className={styles.customMenu} />
        </Sider>
        <Content className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <h2 className={styles.sectionTitle}>{appliedSearchKw ? `KẾT QUẢ CHO: "${appliedSearchKw}"` : 'SẢN PHẨM NỔI BẬT'}</h2>
            <div className={styles.sortTools}>
              <Select value={sortField} className={styles.filterSelect} onChange={handleSortFieldChange}>
                <Option value="">Tiêu chí (Tất cả)</Option>
                <Option value="MaSanPham">Theo ngày</Option>
                <Option value="Gia">Theo Giá</Option>
              </Select>
              <Select value={sortOrder} className={styles.filterSelect} onChange={(val) => {setSortOrder(val); setCurrentPage(1);}} disabled={!sortField}>
                <Option value="">Mặc định</Option>
                {sortField === 'Gia' && (<><Option value="ASC">Thấp đến cao</Option><Option value="DESC">Cao đến thấp</Option></>)}
                {sortField === 'MaSanPham' && (<><Option value="DESC">Gần đây nhất</Option><Option value="ASC">Cũ nhất</Option></>)}
              </Select>
              <Button icon={<ReloadOutlined />} onClick={handleResetFilters} className={styles.resetBtn}>Xóa lọc</Button>
            </div>
          </div>
          <div style={{ overflowX: 'hidden', padding: '0 10px' }}>
            <Spin spinning={loading} tip="Đang tải dữ liệu...">
              {products.length === 0 && !loading ? (<div className={styles.emptyState}>Không tìm thấy sản phẩm nào.</div>) : (
                <Row gutter={[24, 24]}> 
                  {products.map((p) => {
                    const isSoldOut = p.TongSoLuong <= 0;
                    const isDiscontinued = p.TrangThai === 0;
                    const imgUrl = p.Thumbnail || 'https://via.placeholder.com/300x300?text=No+Image';
                    return (
                      <Col xs={24} sm={12} md={12} lg={8} key={p.MaSanPham}>
                        <Badge.Ribbon text={isDiscontinued ? 'Ngừng bán' : 'Hết hàng'} color={isDiscontinued ? 'red' : 'gray'} style={{ display: (isSoldOut || isDiscontinued) ? 'block' : 'none' }}>
                          <div className={`${styles.customCard} ${isDiscontinued ? styles.disabledCard : ''}`} onClick={() => { if (!isDiscontinued) navigate(`/product/${p.MaSanPham}`); else message.warning("Sản phẩm đã ngừng kinh doanh."); }}>
                            <div className={styles.cardImgWrapper}><img alt={p.TenSanPham} src={imgUrl} /></div>
                            <div className={styles.catTag}>{p.DanhMuc?.TenDanhMuc || 'Chưa phân loại'}</div>
                            <h3 className={styles.productName} title={p.TenSanPham}>{p.TenSanPham}</h3>
                            <div className={styles.productPrice}>{formatPrice(p.GiaThapNhat)}</div>
                            <div className={styles.cardButtons}>
                              <button className={styles.btnBuy} disabled={isDiscontinued || isSoldOut} onClick={(e) => handleAddToCart(e, p)}>MUA NGAY</button>
                              <button className={styles.btnDetail}>CHI TIẾT</button>
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
          {totalPages > 1 && (<div className={styles.paginationBox}><Pagination current={currentPage} total={totalPages * 10} onChange={(page) => setCurrentPage(page)} showSizeChanger={false} /></div>)}
        </Content>
      </Layout>
    </Layout>
  );
}

export default Home;