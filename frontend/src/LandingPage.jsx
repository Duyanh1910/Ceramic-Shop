import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ShoppingCartOutlined, 
    SearchOutlined, 
    UserOutlined, 
    EnvironmentOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import styles from './LandingPage.module.css';

function LandingPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isSticky, setIsSticky] = useState(false);

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
            const response = await axios.get('http://localhost:3000/api/v1/products?page=1&limit=8');
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

    const categories = [
        { name: "Đồ phòng bếp", img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300&h=300&fit=crop" },
        { name: "Đồ phòng khách", img: "https://images.unsplash.com/photo-1578898887140-5e580e0c0362?w=300&h=300&fit=crop" },
        { name: "Đồ thờ", img: "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368705/bat_huong_sen_1_xov7f0.jpg" },
        { name: "Đồ phong thủy", img: "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773370680/ca_chep_hoa_rong_1_qgbxrl.jpg" },
        { name: "Đồ trang trí", img: "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773369371/luc_binh_cong_dao_1_tq0p51.jpg" }
    ];

    return (
        <div className={styles.wrapper}>
            
            <div className={styles.topbar}>
                <div className={styles.container}>
                    <div className={styles.topbarInner}>
                        <a href="#"><EnvironmentOutlined /> Hệ thống cửa hàng</a>
                        <span className={styles.divider}>|</span>
                        <a href="#"><PhoneOutlined /> Hotline: <strong>1900 2268</strong></a>
                    </div>
                </div>
            </div>

            <header className={styles.mainHeader}>
                <div className={styles.container}>
                    <div className={styles.headerFlex}>
                        {/* Box Tìm kiếm */}
                        <div className={styles.searchBox}>
                            <SearchOutlined className={styles.iconSearch} />
                            <input type="text" placeholder="Tìm kiếm sản phẩm..." className={styles.searchInput} />
                        </div>

                        <div className={styles.logoBox} onClick={() => navigate('/')}>
                            <h1 className={styles.logoText}>CERAMIC-SHOP</h1>
                            <span className={styles.logoSub}>TINH HOA GỐM SỨ VIỆT</span>
                        </div>

                        <div className={styles.utilityBox}>
                            <div className={styles.iconItem} onClick={() => navigate('/login')}>
                                <UserOutlined />
                            </div>
                            <div className={styles.iconItem} onClick={() => navigate('/cart')}>
                                <ShoppingCartOutlined />
                                {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
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
                                        
                                        {/* Overlay Nút Mua hiển thị khi Hover giống các web E-com lớn */}
                                        <div className={styles.productOverlay}>
                                            <button className={styles.btnAddToCart} onClick={(e) => { e.stopPropagation(); navigate('/login'); }}>
                                                TÙY CHỌN
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
                        <button className={styles.btnViewAll} onClick={() => navigate('/')}>XEM TẤT CẢ SẢN PHẨM</button>
                    </div>
                </div>
            </section>

            {/* 7. FOOTER */}
            <footer id="contact" className={styles.footer}>
                <div className={styles.container}>
                    <div className={styles.footerGrid}>
                        <div className={styles.footerCol}>
                            <h3>HỖ TRỢ KHÁCH HÀNG</h3>
                            <ul>
                                <li><a href="#">Hướng dẫn mua hàng</a></li>
                                <li><a href="#">Chính sách thanh toán</a></li>
                                <li><a href="#">Chính sách giao hàng</a></li>
                                <li><a href="#">Chính sách đổi trả</a></li>
                            </ul>
                        </div>
                        <div className={styles.footerCol}>
                            <h3>THÔNG TIN LIÊN HỆ</h3>
                            <ul>
                                <li>Địa chỉ: Làng nghề Bát Tràng, Gia Lâm, Hà Nội</li>
                                <li>Hotline: 1900 2268</li>
                                <li>Email: cskh@ceramicshop.vn</li>
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
                    <p>© 2026 Bản quyền thuộc về Ceramic Shop. Bảo lưu mọi quyền.</p>
                </div>
            </footer>

        </div>
    );
}

export default LandingPage;