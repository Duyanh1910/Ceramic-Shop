import React, { useState, useEffect } from 'react';
import './Chibi.css';

function Chibi({ passwordVisible, loginSuccess, loginFailed, defaultMsg, successMsg, failMsg }) {
  const [smileStep, setSmileStep] = useState(0);

  useEffect(() => {
    const preloads = [
      '/Neko_smile_1.glb',
      '/Neko_smile_2.glb',
      '/Neko_dame.glb',
      '/Neko_glass.glb'
    ];
    
    preloads.forEach((src) => {
      let link = document.querySelector(`link[href="${src}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = 'prefetch'; 
        link.href = src;
        document.head.appendChild(link);
      }
    });
  }, []);

  useEffect(() => {
    if (loginSuccess) {
      setSmileStep(1);
      const timer = setTimeout(() => {
        setSmileStep(2);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setSmileStep(0);
    }
  }, [loginSuccess]);

  let modelSrc = '/Neko_basic.glb';
  let modelAnimation = 'Idle_Base';
  let messageText = defaultMsg || 'Xin chào đây là trang đăng nhập của Ceramic-Shop';

  if (loginSuccess) {
    modelSrc = smileStep === 2 ? '/Neko_smile_2.glb' : '/Neko_smile_1.glb';
    modelAnimation = 'PetChibiNeeko_KDASuperFan_Joke01cycle.Chibi_Neeko_KDASuperFan';
    messageText = successMsg || 'Đăng nhập thành công! Đang chuyển hướng...';
  } else if (loginFailed) {
    modelSrc = '/Neko_dame.glb';
    modelAnimation = 'Damage_Hurt';
    messageText = failMsg || 'Thông tin chưa chính xác, hãy thử lại nhé!';
  } else if (passwordVisible) {
    modelSrc = '/Neko_glass.glb';
    modelAnimation = 'PetChibiNeeko_KDASuperFan_Joke02cycle.Chibi_Neeko_KDASuperFan';
    messageText = 'Mật khẩu của bạn an toàn đối với tôi';
  }

  return (
    <>
      <div className="speech-bubble">
        {messageText}
      </div>

      <model-viewer 
        src={modelSrc}
        alt="Trợ lý Irelia 3D" 
        autoplay 
        animation-name={modelAnimation}
        camera-orbit="0deg 75deg auto" 
        field-of-view="25deg" 
        camera-target="auto auto auto" 
        max-camera-orbit="auto auto 600%" 
        shadow-intensity="0" 
        interaction-prompt="none"
        disable-zoom
        disable-pan
        disable-tap
        style={{ 
          width: '100%', 
          height: '380px', 
          backgroundColor: 'transparent',
          marginTop: '40px' 
        }}
      ></model-viewer>
    </>
  );
}

export default Chibi;