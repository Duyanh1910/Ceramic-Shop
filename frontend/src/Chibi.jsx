import React from 'react';
import './Chibi.css';

function Chibi({ passwordVisible }) {
  const modelSrc = passwordVisible ? '/Neko_glass.glb' : '/Neko_smile_1.glb';
  const modelAnimation = passwordVisible 
    ? 'PetChibiNeeko_KDASuperFan_Joke02cycle.Chibi_Neeko_KDASuperFan' 
    : 'Idle_Base';
  
  const messageText = passwordVisible 
    ? 'Mật khẩu của bạn an toàn đối với tôi' 
    : 'Xin chào đây là trang đăng nhập của Ceramic-Shop';

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