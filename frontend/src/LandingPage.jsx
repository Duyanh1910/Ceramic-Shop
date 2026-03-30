import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { AutoComplete, Input, Spin } from 'antd';
import { 
    ShoppingCartOutlined, 
    SearchOutlined, 
    UserOutlined, 
    EnvironmentOutlined,
    PhoneOutlined,
    RightOutlined,
    CheckCircleOutlined,
    SafetyOutlined,
    TrophyOutlined,
    CustomerServiceOutlined
} from '@ant-design/icons';
import styles from './LandingPage.module.css';
import { saveSession } from './useAuth.js';

function LandingPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isSticky, setIsSticky] = useState(false);
    
    const [searchKw, setSearchKw] = useState('');
    const [searchOptions, setSearchOptions] = useState([]);
    const inputRef = useRef(null);

    const [isChecking, setIsChecking] = useState(false); 

    useEffect(() => {
        const checkOAuth = async () => {
            const isCustomer = localStorage.getItem('customer_session_active') === 'true';
            const isAdmin = localStorage.getItem('admin_session_active') === 'true';

            if (isCustomer || isAdmin) return;

            try {
                const res = await axios.get('https://ceramic-shop-u8ak.onrender.com/api/v1/auth/me', { 
                    withCredentials: true 
                });
                
                const userData = res.data.user || res.data.result;
                const token = res.data.token || res.data.result?.token || userData?.token;

                if (userData) {
                    const role = userData.role || 'Customer';
                    const profileData = userData.profile || userData;
                    const username = profileData.TenKhachHang || userData.username || 'Thành viên';
                    
                    saveSession(username, role, true, token);
                }
            } catch (err) {
            }
        };
        
        checkOAuth();
    }, []);

    useEffect(() => {
        const savedCart = localStorage.getItem('ceramic_cart');
        if (savedCart) {
            const cartItems = JSON.parse(savedCart);
            const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(count);
        }

        const handleScroll = () => {
            if (window.scrollY > 140) setIsSticky(true);
            else setIsSticky(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://ceramic-shop-u8ak.onrender.com/api/v1/products?page=1&limit=8');
            if (response.data && response.data.result) {
                setProducts(response.data.result.data);
            }
        } catch (error) {
            const mockProducts = [
                { MaSanPham: 1, TenSanPham: "Tượng Cá chép hóa rồng", GiaThapNhat: 850000, Thumbnail: "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773370680/ca_chep_hoa_rong_1_qgbxrl.jpg" },
                { MaSanPham: 2, TenSanPham: "Tượng Thần Tài Biểu Tượng Tài Lộc", GiaThapNhat: 550000, Thumbnail: "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773370053/than_tai_1_jvvsff.jpg" },
                { MaSanPham: 3, TenSanPham: "Tượng Di Lặc", GiaThapNhat: 680000, Thumbnail: "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773369991/di_lac_1_w2hy7r.jpg" },
                { MaSanPham: 4, TenSanPham: "Lục bình Công đào họa tiết nổi", GiaThapNhat: 5000000, Thumbnail: "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773369371/luc_binh_cong_dao_1_tq0p51.jpg" },
                { MaSanPham: 5, TenSanPham: "Lục bình Tứ quý", GiaThapNhat: 4200000, Thumbnail: "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773369259/luc_binh_tu_quy_1_oagyg2.jpg" },
                { MaSanPham: 6, TenSanPham: "Mâm bồng vẽ vàng", GiaThapNhat: 1200000, Thumbnail: "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368756/mam_bong_vang_1_a9xuhc.jpg" },
                { MaSanPham: 7, TenSanPham: "Bát hương hoa sen men rạn", GiaThapNhat: 850000, Thumbnail: "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368705/bat_huong_sen_1_xov7f0.jpg" },
                { MaSanPham: 8, TenSanPham: "Bộ ấm trà tử sa đắp nổi", GiaThapNhat: 1550000, Thumbnail: "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368595/am_tra_tu_sa_1_z9v2n1.jpg" }
            ];
            setProducts(mockProducts);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const handleSearchInput = async (value) => {
        setSearchKw(value);
        if (!value) { setSearchOptions([]); return; }
        try {
            const res = await axios.get(`https://ceramic-shop-u8ak.onrender.com/api/v1/products?limit=1000`);
            let data = res.data.data || res.data.result?.data || [];
            
            const searchLower = value.toLowerCase();
            data = data.filter(item => 
                item.TenSanPham?.toLowerCase().includes(searchLower) ||
                item.ThuongHieu?.toLowerCase().includes(searchLower) ||
                item.DanhMuc?.TenDanhMuc?.toLowerCase().includes(searchLower)
            );

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
            setSearchOptions([]);
        }
    };

    const executeSearch = (val) => {
        const keyword = val || searchKw;
        if (keyword.trim()) {
            navigate(`/?search=${encodeURIComponent(keyword)}`); 
        }
    };

    const categories = [
        { name: "Đồ phòng bếp", img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300&h=300&fit=crop" },
        { name: "Đồ phòng khách", img: "https://images.unsplash.com/photo-1578898887140-5e580e0c0362?w=300&h=300&fit=crop" },
        { name: "Đồ thờ", img: "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368705/bat_huong_sen_1_xov7f0.jpg" },
        { name: "Đồ phong thủy", img: "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773370680/ca_chep_hoa_rong_1_qgbxrl.jpg" },
        { name: "Đồ trang trí", img: "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773369371/luc_binh_cong_dao_1_tq0p51.jpg" }
    ];

    const newsArticles = [
        {
            id: 1,
            title: "Ra mắt bộ sưu tập Gốm Sứ Xuân 2026",
            excerpt: "Khám phá những thiết kế độc đáo lấy cảm hứng từ hoa đào, mai vàng và các biểu tượng may mắn của năm mới.",
            image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=250&fit=crop",
            date: "15/01/2026"
        },
        {
            id: 2,
            title: "Bí quyết chọn bộ ấm trà phù hợp",
            excerpt: "Hướng dẫn chi tiết cách lựa chọn ấm trà tử sa, sứ cao cấp phù hợp với từng loại trà và phong cách thưởng thức.",
            image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=250&fit=crop",
            date: "10/01/2026"
        },
        {
            id: 3,
            title: "Nghệ thuật Bát Tràng - Di sản nghìn năm",
            excerpt: "Tìm hiểu về lịch sử và quy trình làm gốm truyền thống tại làng nghề Bát Tràng nổi tiếng.",
            image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=250&fit=crop",
            date: "05/01/2026"
        }
    ];

    if (isChecking) {
        return (
            <div style={{ 
                height: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                background: '#fdfdfd' 
            }}>
                <Spin size="large" tip="Đang kết nối..." />
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <Helmet>
                <title>CeramicShop - Tinh Hoa Gốm Sứ Việt</title>
                <meta name="description" content="Nơi tinh hoa gốm sứ giao thoa cùng phong cách sống hiện đại" />
            </Helmet>
            
            <div className={styles.topbar}>
                <div className={styles.container}>
                    <div className={styles.topbarInner}>
                        <a href="#"><EnvironmentOutlined /> Hệ thống cửa hàng</a>
                        <span className={styles.divider}>|</span>
                        <a href="#"><PhoneOutlined /> Hotline: <strong>0329835725</strong></a>
                    </div>
                </div>
            </div>

            <header className={styles.mainHeader}>
                <div className={styles.container}>
                    <div className={styles.headerFlex}>
                        
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

                        <div className={styles.searchBox}>
                            <AutoComplete
                                className={styles.searchAutoComplete}
                                options={searchKw ? searchOptions : []}
                                onSelect={(val) => { 
                                    setSearchKw(val); 
                                    executeSearch(val);
                                }}
                                onChange={handleSearchInput}
                                value={searchKw}
                                notFoundContent={null}
                                style={{ width: '100%' }}
                            >
                                <Input 
                                    ref={inputRef}
                                    placeholder="Tìm kiếm sản phẩm..." 
                                    className={styles.searchInput}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            executeSearch(searchKw); 
                                        }
                                    }}
                                    prefix={<SearchOutlined className={styles.iconSearch} onClick={() => executeSearch(searchKw)} />}
                                    variant="borderless"
                                />
                            </AutoComplete>
                        </div>

                        <div className={styles.utilityBox}>
                            <div className={styles.iconItem} onClick={() => navigate('/login')}>
                                <UserOutlined />
                            </div>
                            <div className={styles.iconItem} onClick={() => navigate('/home')}>
                                <ShoppingCartOutlined />
                                <span><b> Mua ngay</b></span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <nav className={`${styles.navBar} ${isSticky ? styles.sticky : ''}`}>
                <div className={styles.container}>
                    <ul className={styles.menuList}>
                        <li><a href="#home" className={styles.active}>TRANG CHỦ</a></li>
                        <li><a href="#about">GIỚI THIỆU</a></li>
                        <li><a href="#categories">SẢN PHẨM</a></li>
                        <li><a href="#news">TIN TỨC</a></li>
                        <li><a href="#contact">LIÊN HỆ</a></li>
                    </ul>
                </div>
            </nav>

            <section id="home" className={styles.bannerSection}>
                <img 
                    src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1920&auto=format&fit=crop" 
                    alt="Banner Gốm Sứ" 
                    className={styles.bannerImg}
                />
                <div className={styles.bannerOverlay}>
                    <div className={styles.bannerContent}>
                        <h2 className={styles.bannerTitle}>TINH HOA GỐM SỨ VIỆT</h2>
                        <p className={styles.bannerSubtitle}>Nơi Nghệ Thuật Giao Thoa Cùng Phong Cách Sống Hiện Đại</p>
                        <button className={styles.btnBanner} onClick={() => navigate('/')}>KHÁM PHÁ NGAY</button>
                    </div>
                </div>
            </section>

            <section id="about" className={styles.aboutSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeading}>
                        <h2>VỀ CERAMICSHOP</h2>
                        <p className={styles.sectionSubtitle}>Nơi Tinh Hoa Gốm Sứ Giao Thoa Cùng Phong Cách Sống Hiện Đại</p>
                    </div>

                    <div className={styles.aboutContent}>
                        <div className={styles.aboutText}>
                            <p className={styles.aboutIntro}>
                                CeramicShop tự hào là thương hiệu mang đến những sản phẩm gốm sứ chất lượng cao, 
                                là sự kết tinh hoàn mỹ giữa tinh hoa nghệ thuật thủ công truyền thống và nhịp sống văn minh, hiện đại. 
                                Chúng tôi tin rằng, mỗi sản phẩm gốm sứ không chỉ đơn thuần là vật dụng phục vụ sinh hoạt hàng ngày, 
                                mà còn là những kiệt tác chứa đựng linh hồn của đất, nước, lửa và tâm huyết của những nghệ nhân tài hoa.
                            </p>
                            <p>
                                CeramicShop ra đời với mong muốn tôn vinh sự sáng tạo và đưa bản sắc văn hóa dân tộc Việt Nam 
                                đến gần hơn với không gian sống của mỗi gia đình.
                            </p>
                        </div>
                        <div className={styles.aboutImage}>
                            <img src="https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&h=400&fit=crop" alt="Gốm sứ thủ công" />
                        </div>
                    </div>

                    <div className={styles.visionMission}>
                        <div className={styles.vmCard}>
                            <div className={styles.vmIcon}>
                                <TrophyOutlined />
                            </div>
                            <h3>TẦM NHÌN</h3>
                            <p>Xây dựng CeramicShop trở thành địa chỉ mua sắm gốm sứ trực tuyến thân thiện và đáng tin cậy, 
                            kết hợp hài hòa giữa nét đẹp truyền thống và công nghệ hiện đại.</p>
                        </div>
                        <div className={styles.vmCard}>
                            <div className={styles.vmIcon}>
                                <SafetyOutlined />
                            </div>
                            <h3>SỨ MỆNH</h3>
                            <p>Kiến tạo sự ấm cúng và an yên cho mọi gia đình thông qua những sản phẩm gốm sứ chất lượng, 
                            không ngừng cải thiện dịch vụ và tôn vinh nét đẹp văn hóa Việt.</p>
                        </div>
                        <div className={styles.vmCard}>
                            <div className={styles.vmIcon}>
                                <CustomerServiceOutlined />
                            </div>
                            <h3>GIÁ TRỊ KHÁCH HÀNG</h3>
                            <p>Sản phẩm mang giá trị văn hóa và nghệ thuật sâu sắc. Mối quan hệ bền vững với sự uy tín, 
                            minh bạch. Thương hiệu chuyên nghiệp, tận tâm trong từng chi tiết.</p>
                        </div>
                    </div>

                    <div className={styles.features}>
                        <div className={styles.featureItem}>
                            <CheckCircleOutlined className={styles.featureIcon} />
                            <h4>Chất Lượng Cao Cấp</h4>
                            <p>Men sứ cao cấp, độ bền bỉ và an toàn tuyệt đối cho sức khỏe</p>
                        </div>
                        <div className={styles.featureItem}>
                            <CheckCircleOutlined className={styles.featureIcon} />
                            <h4>Đa Dạng Sản Phẩm</h4>
                            <p>Từ sứ gia dụng, bộ trà cụ đến vật phẩm phong thủy và đồ thờ</p>
                        </div>
                        <div className={styles.featureItem}>
                            <CheckCircleOutlined className={styles.featureIcon} />
                            <h4>Công Nghệ Hiện Đại</h4>
                            <p>Trợ lý ảo tận tâm và giải pháp thanh toán an toàn</p>
                        </div>
                        <div className={styles.featureItem}>
                            <CheckCircleOutlined className={styles.featureIcon} />
                            <h4>Giao Hàng Toàn Quốc</h4>
                            <p>Đóng gói chuyên nghiệp, bảo hành và đổi trả dễ dàng</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="categories" className={styles.categorySection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeading}>
                        <h2>DANH MỤC SẢN PHẨM</h2>
                    </div>
                    
                    <div className={styles.categoryGrid}>
                        {categories.map((cat, idx) => (
                            <div key={idx} className={styles.categoryItem} onClick={() => navigate('/')}>
                                <div className={styles.categoryImgWrap}>
                                    <img src={cat.img} alt={cat.name} />
                                </div>
                                <h3>{cat.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="products" className={styles.productSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeading}>
                        <h2>SẢN PHẨM NỔI BẬT</h2>
                    </div>

                    {loading ? (
                        <div className={styles.loading}>Đang tải dữ liệu...</div>
                    ) : (
                        <div className={styles.productGrid}>
                            {products.map((p) => (
                                <div key={p.MaSanPham} className={styles.productCard} onClick={() => navigate(`/product/${p.MaSanPham}`)}>
                                    <div className={styles.productImgWrap}>
                                        <img src={p.Thumbnail} alt={p.TenSanPham} />
                                        <div className={styles.productOverlay}>
                                            <button className={styles.btnAddToCart} onClick={(e) => { e.stopPropagation(); navigate(`/product/${p.MaSanPham}`); }}>
                                                XEM CHI TIẾT
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.productInfo}>
                                        <h3 className={styles.productName} title={p.TenSanPham}>{p.TenSanPham}</h3>
                                        <div className={styles.productPrice}>{formatPrice(p.GiaThapNhat)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.btnWrapCenter}>
                        <button className={styles.btnViewAll} onClick={() => navigate('/home')}>XEM TẤT CẢ SẢN PHẨM</button>
                    </div>
                </div>
            </section>

            <section id="news" className={styles.newsSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeading}>
                        <h2>TIN TỨC & SỰ KIỆN</h2>
                        <p className={styles.sectionSubtitle}>Cập nhật xu hướng và kiến thức về gốm sứ</p>
                    </div>

                    <div className={styles.newsGrid}>
                        {newsArticles.map((article) => (
                            <div key={article.id} className={styles.newsCard}>
                                <div className={styles.newsImgWrap}>
                                    <img src={article.image} alt={article.title} />
                                    <div className={styles.newsDate}>{article.date}</div>
                                </div>
                                <div className={styles.newsContent}>
                                    <h3 className={styles.newsTitle}>{article.title}</h3>
                                    <p className={styles.newsExcerpt}>{article.excerpt}</p>
                                    <a href="#" className={styles.newsReadMore}>
                                        Đọc thêm <RightOutlined />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer id="contact" className={styles.footer}>
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

        </div>
    );
}

export default LandingPage;