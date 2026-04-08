import {useState, useEffect} from 'react';
import {
    ArrowLeftOutLined, ArrowRightOutLined, UserOutLined, PhoneOutLined,
    TagOutlined, CheckCircleFilled, ShoppingOutLined,
    CreditCardOutLined, SafetyOutLined, BankOutLined,
    WalletOutLined,} from '@ant-design/icons';
import {
    Form, Input, Button, message, Divider,
    Radio, Tag, Spin, Steps, Modal,
} from 'antd';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import AddressSelector from './AddressSelector';

const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';
const fmt = (p) => new Intl.NumberFormat('vi-VN',{style: 'currency', currency:'VND'})
const PAYMENT_METHODS =[
    {
        id: 1,
        icon: '',
        name:'Thanh toán khi nhận hàng (COD)',
        desc: 'Trả tiền mặt khi nhận hàng',
        gateway: null,
    },
    {
        id: 2,
        name:'Chuyển khoản ngân hàng',
        desc:'Chuyển khoản trước - đơn hàng được xử lý sau khi xác nhận',
        gateway: null,
    },
    {
        id: 3,
        name:'MoMo',
        desc:'Thanh toán qua ví MoMo - chuyển hướng tới cổng thanh toán',
        gateway: null,
    },
    {
        id:4,
        name:'ZaloPay',
        desc:'Thanh toán qua ZaloPay - chuyển hướng tới cổng thành toán',
        gateway: null,
    }
]
export default function Checkout(){
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const isLoggedin = !!token;
    const authHeader = {headers:{Authorization: `Bearer ${token}`}};

    const {selectedItems =[], cartItems = [], applyVoucher = null} = location.state || {};

    const [form] = Form.useForm();
    const [step, setStep] = useState(0);
    const[loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState(1);
    const [addressValue, setAddressValue] = useState('');
    const [addressError, setAddressError] = useState('');
    const [voucherInput, setVoucherInput] = useState(applyVoucher?. TenKhuyenMai || '');
    const [appliedVoucher, setAppliedVoucher] = useState(applyVoucher || null);
    const [voucherLoading, setVoucherLoading] = useState(false);
    const [myVouchers, setMyVouchers] = useState([]);
    const [orderId, setOrderID] = useState(null);
    const [redirectingModal, setRedirectingModal] = useState(false);

    const orderItems= cartItems.filter((i)=> selectedItems.include(i.variantId));
    const subtotal = orderItems.reduce((s,i)=>s+i.price*i.quantity, 0);
    const discount = appliedVoucher ? Math.min(appliedVoucher.GiaTri, appliedVoucher.GiamToiDa ?? Infinity) : 0;

    const total = Math.max(0, subtotal - discount);
    const selectedPayment = PAYMENT_METHODS.find((m) => m.id === paymentMethod);

    useEffect(()=>{
        if(orderItems.L=length ===0) navigate('/cart');
        if(isLoggedin) {fetchProfile(); fetchMyVoucher();}
        else setProfileLoading(false);
    }, []);
    const fetchProfile = async () =>{
        setProfileLoading(true);
        try{
            const res = await axios.get(`${API_BASE}/auth/me`, authHeader);
            const profile = res.data.user?.profile;
            if(profile){
                form.setFieldValue({name: profile.TenKhachHang, phoen: profile.SDT});
            }
        }
        catch{

        }
        finally{ setProfileLoading(false);}
    };

    const fetchMyVoucher = async () => {
        try{
            const res = await axios.get(`${API_BASE}/vouchers/me`, authHeader);
            setMyVouchers(res.data?.voucher || []);
        }
        catch{

        }
    }

    const handleApplyVoucher = async () =>{
        if(!voucherInput.trim()) return;
        setVoucherLoading(true);
        try{
            const res = await axios.get(`${API_BASE}/promotions`);
            const alll = res.data?.voucher || [];
            const found = all.find(
                (v) => v.TenKhuyenMai?.toLowerCase()===voucherInput.trim().toLowerCase() || String(v.MaKhuyenMai)===voucherInput.trim()
            );
            if(!found) {message.error('Mã voucher không tồn tại hoặc đã hết hạn'); return;}
            if(found.GiaTriToiThieu && subtotal<Number(found.GiaTriToiThieu)){
                message.error(`Đơn tối thiếu ${fmt(found.GiaTriToiThieu)} để dùng mã này!`); return;
            }
            setAppliedVoucher(found);
            message.success('Áp dụng voucher thành công!');

        }
        catch{ message.error('Không thể kiểm tra voucher!');}
        finally{setVoucherLoading(false);}
    };

    const handelSelectMyVoucher = async () =>{
        const promo = v.KhuyenMai || v;
        if(promo.GiaTriToiThieu && subtotal < Number(promo.GiaTriToiThieu)){
            message.warning(`Đơn tối thiếu ${fmt(promo.GiaTriToiThieu)} để dùng mã này!`); return;
        }
        setAppliedVoucher(promo);
        setVoucherInput(promo.TenKhuyenMai);
        message.success('Đã áp dụng voucher');
    }

    const createOrder = async () =>{
        const payload = {
            TenNguoiNhan: values.name,
            SDT: values.phone,
            DiaChiGiaoHang: addressValue,
            GhiChu: values.note || '',
            MaPhuongThuc: paymentMethod,
            selectedItems,
            ListMaKhuyenMai: appliedVoucher ? [appliedVoucher.MaKhuyenMai] : [],
        };
        let res;
        if(isLoggedin){
            res = await axios.post(`${API_BASE}/orders`, payload, authHeader);
        }
        else{
            res = await axios.post(`${API_BASE}/orders/guest`,{
                ...payload,
                GuestEmail: values.email,
                cartItems: orderItems.map((i)=>({
                    MaBienThe: i.variantId,
                    SoLuong: i.quantity,
                    GiaBan: i.price,
                    ThanhTien: i.price*i.quantity,
                })),
            });
        }
        return res.data?.result?.MaDonHang;
    };

    const createMoMoPaymnet = async () => {
        const res = await axios.post(`${API_BASE}/payment/momo-create`,{MaDonHang},authHeader);
        return res.data?.paymentUrl;
    };

    const createZaloPayPaymnet = async () => {
        const res = await axios.post(`${API_BASE}/payment/zalo-create`,{MaDonHang},authHeader);
        return res.data?.paymentUrl;
    };

    const handleOrder = async () =>{
        if(!addressValue || addressValue.split(',').length<3){
            setAddressError('Vui lòng chọn đầy đủ thông tin liên quan đến địa chỉ')
            return;
        }
        setAddressError('');
        setLoading(true);
        try{
            const newOrderId = await createOrder(values);
            setOrderId(newOrderId);
            if(paymentMethod === 1 || paymentMethod === 2){
                setStep(1);
                message.success('Đặt hàng thành công');
                return;
            }
            if(paymentMethod === 3){
                setRedirectingModal(true);
                const payUrl = await createMoMoPaymnet(newOrderId);
                if(payUrl){
                    window.location.href = payUrl;
                }
                else{
                    throw new Error('Không nhận được link thanh toán MoMo');
                }
                return;
            }
            if(paymentMethod === 4){
                setRedirectingModal(true);
                const payUrl = await createZaloPayPaymnet(newOrderId);
                if(payUrl){
                    window.location.href = payUrl;
                }
                else{
                    throw new Error('Không nhận được link thanh toán qua ZaloPay');
                }
                return;
            }
        }
        catch{
            setRedirectingModal(false);
            message.error(err.response?.data?.message || err.message || 'Đặt hàng thất bại');
        }
        finally{ setLoading(false);}
    };
    if(step === 1){
        return(
            <div className={style.wrapper}>
                <Helmet><title>Đặt hàng thành công | Ceramic Shop</title></Helmet>
                <header className={style.topHeader}>
                    <div className={style.logo} onClick={() => navigate('/')}>CERAMIC SHOP</div>
                </header>
                <div className={style.successWrapper}>
                    <div className={style.successCard}>
                        <CheckCircleFilled className={style.successIcon}/>
                        <h2 className={style.successTitle}>Đặt hàng thành công!</h2>
                        {orderId && <p className={style.successOrderId}>Mã đơn hàng: <strong>#{orderId}</strong></p>}
                        <p className={style.successSub}>
                            Cảm ơn bạn đã mua sắm tại Ceramic Shop! <br />
                            Đơn hàng của bạn đang được xử lý
                        </p>

                        {paymentMethod === 2 &&(
                            <div className={style.bankInfo}>
                                <div className={styles.bankTitle}>Thông tin chuyển khoản</div>
                                <div className={styles.bankRow}><span>Ngân hàng</span><strong>Vietcombank</strong></div>
                                <div className={styles.bankRow}><span>Số tài khoản</span><strong>1234567890</strong></div>
                                <div className={styles.bankRow}><span>Chủ tài khoản</span><strong>CERAMIC SHOP</strong></div>
                                <div className={styles.bankRow}><span>Số tiền</span><strong style={{ color: '#d0021b' }}>{fmt(total)}</strong></div>
                                <div className={styles.bankRow}><span>Nội dung</span><strong>DH{orderId}</strong></div>
                            </div>
                        )}
                        <div className={styles.successAction}>
                            {isLoggedin && (
                                <Button className={styles.btnOrders} onClick={()=>navigate('/orders')}>Theo dõi đơn hàng</Button>
                            )}
                            <Button type='primary' className={styles.btnHome} onClick={()=>navigate('/home')}>Về cửa hàng</Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}