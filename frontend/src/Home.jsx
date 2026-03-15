import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dropdown, Avatar, Space, Layout, Menu, Input, Select, Row, Col, Card, Pagination, Spin, Badge, message } from 'antd';
import { LogoutOutlined, SettingOutlined, DropboxOutlined, SearchOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styles from './Home.module.css';

const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { Meta } = Card;

function Home() {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchKw, setSearchKw] = useState('');
  const [sortField, setSortField] = useState('MaSanPham');
  const [sortOrder, setSortOrder] = useState('DESC');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const userMenu = [
    { key: '1', label: 'Sửa hồ sơ', icon: <SettingOutlined /> },
    { type: 'divider' },
    { key: '2', danger: true, label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: handleLogout },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/v1/categories');
        const catData = res.data.result || [];
        
        const menuItems = [
          { key: 'all', icon: <AppstoreOutlined />, label: 'Tất cả sản phẩm' },
          ...catData.map(cat => ({
            key: cat.MaDanhMuc.toString(),
            label: cat.TenDanhMuc,
          }))
        ];
        setCategories(menuItems);
      } catch (error) {
        message.error('Lỗi khi tải danh mục!');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 8,
          sort: sortField,
          order: sortOrder,
        };
        if (searchKw) {
          params.search = searchKw;
          params.searchField = 'TenSanPham';
        }
        if (selectedCategory && selectedCategory !== 'all') {
          params.category = selectedCategory;
        }

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
  }, [currentPage, selectedCategory, searchKw, sortField, sortOrder]);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <Layout className={styles.homeWrapper}>
      <Helmet>
        <title>Trang chủ | The Ceramic Shop</title>
      </Helmet>
      <Header className={styles.topHeader}>
        <div className={styles.logo}>CERAMIC-SHOP</div>
        <div style={{ marginLeft: 'auto' }}>
          <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow>
            <Space className={styles.userProfile}>
              <Avatar src="https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png" />
              <span className={styles.userName}></span>
            </Space>
          </Dropdown>
        </div>
      </Header>

      <Layout className={styles.mainContainer}>
        <Sider width={280} className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}><i className="fas fa-vase"></i> Gốm Sứ Tinh Hoa</h2>
          <Menu
            mode="inline"
            selectedKeys={[selectedCategory || 'all']}
            onClick={(e) => {
              setSelectedCategory(e.key);
              setCurrentPage(1);
            }}
            items={categories}
            className={styles.customMenu}
          />
        </Sider>

        <Content className={styles.mainContent}>
          
          <div className={styles.toolbar}>
            <Input 
              placeholder="Tìm kiếm bộ ấm trà, bình hoa..." 
              prefix={<SearchOutlined style={{ color: '#888' }}/>}
              className={styles.searchInput}
              onPressEnter={(e) => {
                setSearchKw(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Select defaultValue="MaSanPham" className={styles.filterSelect} onChange={val => setSortField(val)}>
              <Option value="MaSanPham">Mới nhất</Option>
              <Option value="Gia">Theo Giá</Option>
            </Select>
            <Select defaultValue="DESC" className={styles.filterSelect} onChange={val => setSortOrder(val)}>
              <Option value="DESC">Giảm dần (Cao ➔ Thấp)</Option>
              <Option value="ASC">Tăng dần (Thấp ➔ Cao)</Option>
            </Select>
          </div>

          <Spin spinning={loading} tip="Đang tải tinh hoa gốm sứ...">
            {products.length === 0 && !loading ? (
               <div className={styles.emptyState}>Không tìm thấy sản phẩm nào.</div>
            ) : (
              <Row gutter={[24, 24]}>
                {products.map((p) => {
                  const isSoldOut = p.TongSoLuong <= 0;
                  const isDiscontinued = p.TrangThai === 0;
                  const imgUrl = p.Thumbnail || 'https://via.placeholder.com/300x300?text=No+Image';

                  return (
                    <Col xs={24} sm={12} md={8} lg={6} key={p.MaSanPham}>
                      <Badge.Ribbon 
                        text={isDiscontinued ? 'Ngừng bán' : 'Hết hàng'} 
                        color={isDiscontinued ? 'red' : 'gray'} 
                        style={{ display: (isSoldOut || isDiscontinued) ? 'block' : 'none' }}
                      >
                        <Card
                          hoverable
                          className={`${styles.productCard} ${isDiscontinued ? styles.disabledCard : ''}`}
                          cover={<div className={styles.imgWrapper}><img alt={p.TenSanPham} src={imgUrl} /></div>}
                          onClick={() => {
                            if (!isDiscontinued) navigate(`/product/${p.MaSanPham}`);
                            else message.warning("Sản phẩm này đã ngừng kinh doanh.");
                          }}
                        >
                          <div className={styles.catTag}>{p.DanhMuc?.TenDanhMuc || 'Chưa phân loại'}</div>
                          <Meta 
                            title={p.TenSanPham} 
                            description={
                              <div className={styles.priceRow}>
                                <span className={styles.price}>{formatPrice(p.GiaThapNhat)}</span>
                                <span className={styles.stock}>Kho: {p.TongSoLuong}</span>
                              </div>
                            } 
                          />
                        </Card>
                      </Badge.Ribbon>
                    </Col>
                  );
                })}
              </Row>
            )}
          </Spin>

          {totalPages > 1 && (
            <div className={styles.paginationBox}>
              <Pagination 
                current={currentPage} 
                total={totalPages * 10} 
                onChange={(page) => setCurrentPage(page)} 
                showSizeChanger={false}
              />
            </div>
          )}

        </Content>
      </Layout>
    </Layout>
  );
}

export default Home;