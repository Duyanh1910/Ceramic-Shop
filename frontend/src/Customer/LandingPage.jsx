import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { AutoComplete, Input, Spin, Carousel } from 'antd';
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
    CustomerServiceOutlined,
    ShoppingFilled,
    AppstoreOutlined,
    LaptopOutlined,
    TruckOutlined,
    HeartOutlined
} from '@ant-design/icons';
import styles from './LandingPage.module.css';
import { saveSession } from '../Utility/useAuth.js';
import Footer from '../Utility/Footer'; 

const bannerSlides = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1920&auto=format&fit=crop',
        title: 'TINH HOA GỐM SỨ VIỆT',
        subtitle: 'Nơi Nghệ Thuật Giao Thoa Cùng Phong Cách Sống Hiện Đại',
        btnText: 'KHÁM PHÁ NGAY',
        link: '/home'
    },
    {
        id: 2,
        image: 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1775186597/porcelain-and-ceramics-1024x683_j22ily.jpg',
        title: 'QUÀ TẶNG TRÀ ĐẠO',
        subtitle: 'Gửi gắm tâm ý qua từng tác phẩm gốm sứ thủ công',
        btnText: 'TÌM BỘ ẤM TRÀ',
        link: '/home?search=bộ ấm trà'
    },
    {
        id: 3,
        image: 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1775186648/blue-white-chinoiserie-design-497489_scgryl.jpg',
        title: 'GỐM SỨ PHONG THỦY',
        subtitle: 'Kiến tạo vượng khí - Tặng mã PHONGTHUY100 giảm ngay 100K',
        btnText: 'THỈNH VẬT PHẨM',
        link: '/home?category=4'
    }
];

function LandingPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isSticky, setIsSticky] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    
    const [searchKw, setSearchKw] = useState('');
    const [searchOptions, setSearchOptions] = useState([]);
    const inputRef = useRef(null);

    const [newsArticles, setNewsArticles] = useState([]);
    const [loadingNews, setLoadingNews] = useState(false);

    const [isChecking, setIsChecking] = useState(false);
    const [apiCategories, setApiCategories] = useState([]);

    const trackRef = useRef(null);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const isDragging = useRef(false);
    const isDragMoved = useRef(false);
    const startX = useRef(0);
    const scrollLeftRef = useRef(0);
    const reqRef = useRef();
    const exactScroll = useRef(0);
    
    const featureRefs = useRef([]);
    const vmRefs = useRef([]);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const track = trackRef.current;
        if (!track) return;

        setTimeout(() => {
            if(track) exactScroll.current = track.scrollLeft;
        }, 100);

        const scroll = () => {
            if (track && track.children.length > 0) {
                exactScroll.current += 0.5;
                track.scrollLeft = Math.floor(exactScroll.current);

                const setWidth = track.scrollWidth / 3;
                if (track.scrollLeft >= setWidth * 2) {
                    exactScroll.current -= setWidth;
                    track.scrollLeft = Math.floor(exactScroll.current);
                }
            }
            reqRef.current = requestAnimationFrame(scroll);
        };
        reqRef.current = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(reqRef.current);
    }, [isAutoPlaying, apiCategories]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(styles.animateIn);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        );

        featureRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        vmRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    const handleDragStart = (e) => {
        setIsAutoPlaying(false);
        isDragging.current = true;
        isDragMoved.current = false;
        const track = trackRef.current;
        if (!track) return;
        
        const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        startX.current = pageX - track.offsetLeft;
        scrollLeftRef.current = track.scrollLeft;
        track.style.cursor = 'grabbing';
    };

    const handleDragMove = (e) => {
        if (!isDragging.current) return;
        const track = trackRef.current;
        if (!track) return;

        const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        const x = pageX - track.offsetLeft;
        const walk = (x - startX.current) * 1.5; 
        
        if (Math.abs(walk) > 5) {
            isDragMoved.current = true;
        }

        let newScroll = scrollLeftRef.current - walk;
        const setWidth = track.scrollWidth / 3;

        if (newScroll >= setWidth * 2) {
            scrollLeftRef.current -= setWidth;
            newScroll -= setWidth;
        } else if (newScroll <= 0) {
            scrollLeftRef.current += setWidth;
            newScroll += setWidth;
        }
        
        track.scrollLeft = newScroll;
        exactScroll.current = newScroll;
    };

    const handleDragEnd = () => {
        isDragging.current = false;
        if (trackRef.current) trackRef.current.style.cursor = 'grab';
        setIsAutoPlaying(true);
    };

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await axios.get('https://ceramic-shop-u8ak.onrender.com/api/v1/categories');
                const all = res.data?.result || [];
                setApiCategories(all.filter(c => !c.ParentID));
            } catch {}
        };
        fetchCats();
    }, []);

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

            const sections = ['home', 'about', 'categories', 'news', 'contact'];
            let current = 'home';
            for (let sectionId of sections) {
                const section = document.getElementById(sectionId);
                if (section) {
                    const sectionTop = section.offsetTop;
                    if (window.scrollY >= sectionTop - 150) { 
                        current = sectionId;
                    }
                }
            }
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10) {
                current = 'contact';
            }
            setActiveSection(current);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setLoadingNews(true);
        try {
            const response = await axios.get('https://ceramic-shop-u8ak.onrender.com/api/v1/news');
            const data = response.data?.result || response.data?.data || response.data || [];
            setNewsArticles(data.slice(0, 3));
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingNews(false);
        }
    };

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

    const executeSearch = () => {
        if (searchKw && searchKw.trim()) {
            navigate(`/home?search=${searchKw.trim()}`); 
        }
    };

    const CATEGORY_IMGS = {
        "Đồ phòng bếp": "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773744001/bo-do-an-30-san-pham-hoang-cung-lac-hong-30208-00_z2uoxf.png",
        "Đồ phòng khách": "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773798497/00-f5e6732e-77c1-489d-9972-0804386f0860_nsci6h.webp", 
        "Đồ thờ": "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773801851/RD060723-2-removebg-preview_vnbzkb.png" ,
        "Đồ phong thủy": "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818260/thum-removebg-preview_f0xndm.png" ,
        "Đồ trang trí": "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823016/mtmt_ayvor6.webp" ,
    };

    const categories = apiCategories.length > 0
    ? apiCategories.map(c => ({
        id: c.MaDanhMuc,
        name: c.TenDanhMuc,
        img: CATEGORY_IMGS[c.TenDanhMuc]
    }))
    : Object.entries(CATEGORY_IMGS).map(([name, img]) => ({ id: null, name, img }));

    const handleOrderTracking = (e) => {
        e.preventDefault();
        const isCustomer = localStorage.getItem('customer_session_active') === 'true';
        
        if (isCustomer) {
            navigate('/orders');
        } else {
            alert('Vui lòng đăng nhập hệ thống để xem danh sách đơn hàng của bạn!');
            navigate('/login');
        }
    };

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
                <title className={styles.title}>CeramicShop - Tinh Hoa Gốm Sứ Việt</title>
                <meta name="description" content="Nơi tinh hoa gốm sứ giao thoa cùng phong cách sống hiện đại" />
            </Helmet>
            
            <div className={styles.topbar}>
                <div className={styles.container}>
                    <div className={styles.topbarInner}>
                        <div className={styles.topbarLeft}>
                            <span className={styles.topbarPromo}>
                                🛡️ Bao bể vỡ - Cam kết 1 đổi 1 toàn quốc | 🎁 Nhập mã <strong>GOMSU10</strong> - Giảm ngay 10%
                            </span>
                        </div>

                        <div className={styles.topbarRight}>
                            <a href="#" onClick={handleOrderTracking}>
                                Tra cứu đơn hàng
                            </a>
                            <span className={styles.divider}>|</span>
                            <a href="https://maps.google.com/?q=484+Lạch+Tray,+Hải+Phòng" target="_blank" rel="noopener noreferrer">
                                <EnvironmentOutlined /> Hệ thống cửa hàng
                            </a>
                            <span className={styles.divider}>|</span>
                            <a href="tel:0329835725">
                                <PhoneOutlined /> Hotline: <strong>0329835725</strong>
                            </a>
                        </div>
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
                                    if (val && val.trim()) {
                                        navigate(`/home?search=${val.trim()}`);
                                    }
                                }}
                                onChange={handleSearchInput}
                                value={searchKw}
                                notFoundContent={null}
                                style={{ width: '100%' }}
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
                                    suffix={<SearchOutlined style={{ color: '#1b437c', cursor: 'pointer', fontSize: '18px', paddingRight: '8px' }} onClick={executeSearch} />}
                                    variant="borderless"
                                />
                            </AutoComplete>
                        </div>

                        <div className={styles.utilityBox}>
                            <div className={styles.iconItem} onClick={() => navigate('/login')}>
                                <UserOutlined />
                            </div>
                            <div className={styles.iconItem} onClick={() => navigate('/home')}>
                                <ShoppingFilled />
                                <span><b> Mua ngay</b></span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <nav className={`${styles.navBar} ${isSticky ? styles.sticky : ''}`}>
                <div className={styles.container}>
                    <ul className={styles.menuList}>
                        <li><a href="#home" className={activeSection === 'home' ? styles.active : ''}>TRANG CHỦ</a></li>
                        <li><a href="#about" className={activeSection === 'about' ? styles.active : ''}>GIỚI THIỆU</a></li>
                        <li><a href="#categories" className={activeSection === 'categories' ? styles.active : ''}>SẢN PHẨM</a></li>
                        <li><a href="#news" className={activeSection === 'news' ? styles.active : ''}>TIN TỨC</a></li>
                        <li><a href="#contact" className={activeSection === 'contact' ? styles.active : ''}>LIÊN HỆ</a></li>
                    </ul>
                </div>
            </nav>

            <section id="home" className={styles.bannerSection}>
                <Carousel autoplay autoplaySpeed={4000} pauseOnHover={false} draggable={true} swipeToSlide={true}>
                    {bannerSlides.map((slide) => (
                        <div key={slide.id}>
                            <div className={styles.slideWrapper}>
                                <img src={slide.image} alt={slide.title} className={styles.bannerImg} />
                                <div className={styles.bannerOverlay}>
                                    <div className={styles.bannerContent}>
                                        <h2 className={styles.bannerTitle}>{slide.title}</h2>
                                        <p className={styles.bannerSubtitle}>{slide.subtitle}</p>
                                        <button className={styles.btnBanner} onClick={() => navigate(slide.link)}>
                                            {slide.btnText}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </Carousel>
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
                            <img src="https://res.cloudinary.com/dcmwz0uis/image/upload/v1775634050/pottery-decorative-ceramics-lookbooks_dezeen_2364_col_3-2048x1151_trj563.jpg" alt="Gốm sứ thủ công" />
                        </div>
                    </div>

                    <div className={styles.visionMission}>
                        <div className={`${styles.vmCard} ${styles.hiddenStart}`} ref={(el) => (vmRefs.current[0] = el)} style={{ transitionDelay: '0s' }}>
                            <div className={styles.iconWrapper} style={{ backgroundColor: '#009bb6' }}>
                                <TrophyOutlined className={styles.featureIcon} />
                            </div>
                            <h3>TẦM NHÌN</h3>
                            <p>Xây dựng CeramicShop trở thành địa chỉ mua sắm gốm sứ trực tuyến thân thiện và đáng tin cậy, kết hợp hài hòa giữa nét đẹp truyền thống và công nghệ hiện đại.</p>
                        </div>
                        <div className={`${styles.vmCard} ${styles.hiddenStart}`} ref={(el) => (vmRefs.current[1] = el)} style={{ transitionDelay: '0.15s' }}>
                            <div className={styles.iconWrapper} style={{ backgroundColor: '#eeb406' }}>
                                <SafetyOutlined className={styles.featureIcon} />
                            </div>
                            <h3>SỨ MỆNH</h3>
                            <p>Kiến tạo sự ấm cúng và an yên cho mọi gia đình thông qua những sản phẩm gốm sứ chất lượng, không ngừng cải thiện dịch vụ và tôn vinh nét đẹp văn hóa Việt.</p>
                        </div>
                        <div className={`${styles.vmCard} ${styles.hiddenStart}`} ref={(el) => (vmRefs.current[2] = el)} style={{ transitionDelay: '0.3s' }}>
                            <div className={styles.iconWrapper} style={{ backgroundColor: '#009bb6' }}>
                                <HeartOutlined className={styles.featureIcon} />
                            </div>
                            <h3>GIÁ TRỊ KHÁCH HÀNG</h3>
                            <p>Sản phẩm mang giá trị văn hóa và nghệ thuật sâu sắc. Mối quan hệ bền vững với sự uy tín, minh bạch. Thương hiệu chuyên nghiệp, tận tâm trong từng chi tiết.</p>
                        </div>
                    </div>

                    <div className={styles.features}>
                        {[
                            { 
                                title: "Chất Lượng Cao Cấp", 
                                desc: "Men sứ cao cấp, độ bền bỉ và an toàn tuyệt đối cho sức khỏe", 
                                icon: <SafetyOutlined className={styles.featureIcon} />,
                                color: "#009bb6" 
                            },
                            { 
                                title: "Đa Dạng Sản Phẩm", 
                                desc: "Từ sứ gia dụng, bộ trà cụ đến vật phẩm phong thủy và đồ thờ", 
                                icon: <AppstoreOutlined className={styles.featureIcon} />,
                                color: "#eeb406" 
                            },
                            { 
                                title: "Công Nghệ Hiện Đại", 
                                desc: "Trợ lý ảo tận tâm và giải pháp thanh toán an toàn", 
                                icon: <LaptopOutlined className={styles.featureIcon} />,
                                color: "#009bb6" 
                            },
                            { 
                                title: "Giao Hàng Toàn Quốc", 
                                desc: "Đóng gói chuyên nghiệp, bảo hành và đổi trả dễ dàng", 
                                icon: <TruckOutlined className={styles.featureIcon} />,
                                color: "#eeb406" 
                            }
                        ].map((item, index) => (
                            <div 
                                key={index}
                                className={`${styles.featureItem} ${styles.hiddenStart}`}
                                ref={(el) => (featureRefs.current[index] = el)}
                                style={{ transitionDelay: `${index * 0.15}s` }} 
                            >
                                <div className={styles.iconWrapper} style={{ backgroundColor: item.color }}>
                                    {item.icon}
                                </div>
                                <h4>{item.title}</h4>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="categories" className={styles.categorySectionDark}>
                <div className={styles.container}>
                    <div className={styles.sectionHeadingDark}>
                        <h2>DANH MỤC SẢN PHẨM</h2>
                        <p>Khám phá các dòng sản phẩm gốm sứ tinh hoa</p>
                        <p className={styles.instructionText}>* Nhấp đúp để khám phá danh mục</p>
                    </div>
                    
                    <div className={styles.marqueeContainer}>
                        <div 
                            className={styles.marqueeTrack}
                            ref={trackRef}
                            onMouseDown={handleDragStart}
                            onMouseMove={handleDragMove}
                            onMouseUp={handleDragEnd}
                            onMouseLeave={handleDragEnd}
                            onTouchStart={handleDragStart}
                            onTouchMove={handleDragMove}
                            onTouchEnd={handleDragEnd}
                        >
                            {[...categories, ...categories, ...categories].map((cat, idx) => (
                                <div 
                                    key={idx} 
                                    className={styles.marqueeItem} 
                                    onDoubleClick={(e) => {
                                        if (isDragMoved.current) {
                                            e.preventDefault();
                                            return;
                                        }
                                        cat.id ? navigate(`/home?category=${cat.id}`) : navigate(`/home`);
                                    }}
                                >
                                    <div className={styles.marqueeImgWrap}>
                                        <img src={cat.img} alt={cat.name} draggable="false" />
                                        <div className={styles.marqueeTextWrap}>
                                            <h3 className={styles.marqueeText}>{cat.name}</h3>
                                            <span className={styles.marqueeSubText}>Khám phá chi tiết</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                        {loadingNews ? (
                            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px 0' }}>
                                <Spin tip="Đang tải tin tức..." />
                            </div>
                        ) : newsArticles.length > 0 ? (
                            newsArticles.map((article) => (
                                <div 
                                    key={article.MaTinTuc} 
                                    className={styles.newsCard} 
                                    onClick={() => navigate(`/news/${article.MaTinTuc}`)} 
                                >
                                    <div className={styles.newsImgWrap}>
                                        <img src={article.HinhAnh || 'https://via.placeholder.com/400x250'} alt={article.TieuDe} />
                                        <div className={styles.newsDate}>
                                            {new Date(article.NgayTao).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                    <div className={styles.newsContent}>
                                        <h3 className={styles.newsTitle} title={article.TieuDe}>
                                            {article.TieuDe}
                                        </h3>
                                        <p className={styles.newsExcerpt}>
                                            {article.NoiDung 
                                                ? article.NoiDung.replace(/<[^>]+>/g, '').substring(0, 120) + '...' 
                                                : 'Đang cập nhật nội dung...'}
                                        </p>
                                        <span 
                                            className={styles.newsReadMore}
                                            style={{ cursor: 'pointer' }}
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                navigate(`/news/${article.MaTinTuc}`);
                                            }}
                                        >
                                            Đọc thêm <RightOutlined />
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#888' }}>
                                Hiện chưa có tin tức nào.
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <Footer />
            
        </div>
    );
}

export default LandingPage;