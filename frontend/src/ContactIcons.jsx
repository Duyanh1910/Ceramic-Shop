import React from 'react';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import './ContactIcons.css';

const ContactIcons = () => {
  return (
    <div className="contact-floating-wrapper">
      {/* Nút Zalo */}
      <a 
        href="https://zalo.me/0329835725" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="contact-icon-btn btn-zalo"
        title="Chat qua Zalo"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" />
      </a>

      {/* Nút Gmail */}
      <a 
        href="mailto:theceramicshop24@gmail.com" 
        className="contact-icon-btn btn-gmail"
        title="Gửi Email"
      >
        <MailOutlined />
      </a>

      {/* Nút Điện thoại */}
      <a 
        href="tel:0329835725" 
        className="contact-icon-btn btn-phone"
        title="Gọi Hotline"
      >
        <PhoneOutlined />
      </a>
    </div>
  );
};

export default ContactIcons;