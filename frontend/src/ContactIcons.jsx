import React, { useState } from 'react';
import './ContactIcons.css';

const ContactIcons = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleContact = () => {
    setIsOpen(!isOpen);
  };

  const icons = {
    mainPhone: 'https://cdn-icons-png.flaticon.com/512/724/724664.png',
    arrowUp: 'https://cdn-icons-png.flaticon.com/512/271/271239.png',
    close: 'https://cdn-icons-png.flaticon.com/512/2997/2997911.png',
    zalo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg',
    gmail: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',
    facebook: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg',
    phone: 'https://cdn-icons-png.flaticon.com/512/724/724664.png',
  };

  return (
    <div className={`contact-wrapper ${isOpen ? 'open' : ''}`}>
      <button className="contact-toggle-btn" onClick={toggleContact} title={isOpen ? "Đóng liên hệ" : "Liên hệ"}>
        {isOpen ? (
          <img src={icons.close} alt="Close" className="close-icon" />
        ) : (
          <>
            <img src={icons.mainPhone} alt="Phone" className="main-phone-icon" />
            <img src={icons.arrowUp} alt="Arrow" className="main-arrow-icon" />
          </>
        )}
      </button>

      <div className="contact-list">
        <a 
          href="tel:0329835725" 
          className="contact-icon-btn btn-phone"
          title="Gọi Hotline"
        >
          <img src={icons.phone} alt="Hotline" />
        </a>

        <a 
          href="https://www.facebook.com/tran.duy.anh.714185" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="contact-icon-btn btn-facebook"
          title="Theo dõi trên Facebook"
        >
          <img src={icons.facebook} alt="Facebook" />
        </a>

        <a 
          href="mailto:theceramicshop24@gmail.com" 
          className="contact-icon-btn btn-gmail"
          title="Gửi Email"
        >
          <img src={icons.gmail} alt="Gmail" />
        </a>

        <a 
          href="https://zalo.me/0329835725" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="contact-icon-btn btn-zalo"
          title="Chat qua Zalo"
        >
          <img src={icons.zalo} alt="Zalo" />
        </a>
      </div>
    </div>
  );
};

export default ContactIcons;