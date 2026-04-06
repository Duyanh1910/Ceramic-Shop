import {useState, useEffect} from 'react';
import {} from '@ant-design/icons';
import {Spin, Layout, Divider, message, Row, Col, Form,

} from 'antd';
import axios from 'axios';

const{Header} = Layout;
function Checkout(){
    const [form] = Form.useForm();
    const[loading, setLoading] = useState(false);
    const[submitting, setSubmitting] = useState(false);
    const[isLoggedIn, setIsLoggedIn] = useState(false);
    
    
}