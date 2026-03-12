import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
function Home() {
  const navigate = useNavigate();


  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={styles.homeWrapper}>
    <h1>CHÀO MỪNG ĐẾN VỚI TRANG CHỦ CERAMIC-SHOP 🎉</h1>
    <Button type="primary" danger onClick={handleLogout}>
      Đăng Xuất
    </Button>
  </div>
  );
}

export default Home;