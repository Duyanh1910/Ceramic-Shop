import React, { useEffect, useRef, useState } from 'react';
// 1. ĐÃ SỬA: Import file CSS thuần (Nhớ đổi tên file như Bước 1 nhé)
import './ChatBot.css'; 

const animationConfigs = [
    { name: 'Idle_Base', file: '/basic.glb' },
    { name: 'Cast_Cycle', file: '/basic.glb' },
    { name: 'Cast_Cycle', file: '/smile.glb' },
    { name: 'Joke', file: '/basic.glb' },
    { name: 'Laugh01', file: '/smile.glb' }, 
    { name: 'Taunt_loop', file: '/basic.glb' }, 
    { name: 'Dance_In', file: '/happy.glb' },
    { name: 'Dance_Loop', file: '/happy.glb' }, 
];

function ChatBot() {
  const chibiRef = useRef(null);
  const animBtnRef = useRef(null);
  const [currentAnimIndex, setCurrentAnimIndex] = useState(0);

  useEffect(() => {
    // 2. CHỐNG LOAD SCRIPT 2 LẦN (LỖI REACT STRICT MODE)
    if (!document.getElementById('model-viewer-script')) {
        const modelViewerScript = document.createElement('script');
        modelViewerScript.id = 'model-viewer-script';
        modelViewerScript.type = 'module';
        modelViewerScript.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
        document.body.appendChild(modelViewerScript);
    }

    if (!document.getElementById('df-messenger-script')) {
        const dfScript = document.createElement('script');
        dfScript.id = 'df-messenger-script';
        dfScript.src = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1';
        document.body.appendChild(dfScript);
    }

    let isBotSetup = false;

    const setupBot = () => {
      if (isBotSetup) return; // Tránh khởi tạo 2 lần
      const dfMessenger = document.querySelector('df-messenger');
      if (!dfMessenger || !dfMessenger.shadowRoot) return;
      
      isBotSetup = true;
      const chibi = chibiRef.current;
      const animBtn = animBtnRef.current;
      
      if (!chibi || !animBtn) return;

      // Chèn CSS ẩn icon Dialogflow mặc định
      if (!dfMessenger.shadowRoot.querySelector('#custom-df-style')) {
          const style = document.createElement('style');
          style.id = 'custom-df-style';
          style.textContent = `
            df-messenger-chat-bubble, 
            #widgetIcon { 
                opacity: 0 !important; 
                visibility: hidden !important; 
                pointer-events: none !important; 
                position: absolute !important;
                z-index: -1 !important;
            }
          `;
          dfMessenger.shadowRoot.appendChild(style);
      }

      const handleChibiClick = () => {
        const isExpanded = dfMessenger.hasAttribute('expand') && dfMessenger.getAttribute('expand') !== 'false';
        
        try {
            const chatWindow = dfMessenger.shadowRoot.querySelector('df-messenger-chat');
            if (chatWindow && chatWindow.shadowRoot) {
                const userInput = chatWindow.shadowRoot.querySelector('df-messenger-user-input');
                if (userInput && userInput.shadowRoot && !userInput.hasAttribute('styled-input')) {
                    const inputStyle = document.createElement('style');
                    inputStyle.textContent = `
                        input[type="text"] {
                            font-size: 14px !important;
                            padding-top: 16px !important;
                            padding-bottom: 16px !important;
                        }
                    `;
                    userInput.shadowRoot.appendChild(inputStyle);
                    userInput.setAttribute('styled-input', 'true');
                }
            }
        } catch(e) { console.log(e); }

        if (!isExpanded) {
            // Mở khung chat
            if (chibi.getAttribute('src') !== '/smile.glb') {
                chibi.setAttribute('src', '/smile.glb');
            }
            chibi.setAttribute('animation-name', 'Laugh01');

            const widgetIcon = dfMessenger.shadowRoot.querySelector('#widgetIcon');
            const chatBubble = dfMessenger.shadowRoot.querySelector('df-messenger-chat-bubble');
            
            if (widgetIcon) widgetIcon.click();
            else if (chatBubble) chatBubble.click();
            else dfMessenger.setAttribute('expand', 'true');
        } else {
            // Đóng khung chat
            setCurrentAnimIndex(0);
            if (chibi.getAttribute('src') !== animationConfigs[0].file) {
                chibi.setAttribute('src', animationConfigs[0].file);
            }
            chibi.setAttribute('animation-name', animationConfigs[0].name);

            const chatWindow = dfMessenger.shadowRoot.querySelector('df-messenger-chat');
            if (chatWindow) {
                const titleBar = chatWindow.shadowRoot.querySelector('df-messenger-titlebar');
                if (titleBar && titleBar.shadowRoot) {
                    const closeButton = titleBar.shadowRoot.querySelector('button');
                    if (closeButton) {
                        closeButton.click();
                        return; 
                    }
                }
            }
            dfMessenger.removeAttribute('expand');
            dfMessenger.setAttribute('expand', 'false');
        }
      };

      chibi.addEventListener('click', handleChibiClick);

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'expand') {
                const isExpanded = dfMessenger.hasAttribute('expand') && dfMessenger.getAttribute('expand') !== 'false';
                
                if (isExpanded) {
                    if (window.innerWidth < 768) {
                        chibi.style.display = 'none';
                        animBtn.style.display = 'none';
                    } else {
                        chibi.style.right = '280px'; 
                        chibi.style.bottom = '-200px'; 
                        animBtn.style.right = '480px';
                        animBtn.style.bottom = '250px'; 
                    }
                } else {
                    setCurrentAnimIndex(0);
                    if (chibi.getAttribute('src') !== animationConfigs[0].file) {
                        chibi.setAttribute('src', animationConfigs[0].file);
                    }
                    chibi.setAttribute('animation-name', animationConfigs[0].name);

                    if (window.innerWidth < 768) {
                        chibi.style.display = 'block';
                        animBtn.style.display = 'flex';
                    }
                    
                    chibi.style.right = '-120px'; 
                    chibi.style.bottom = '-200px'; 
                    
                    animBtn.style.display = 'flex';
                    animBtn.style.right = '80px'; 
                    animBtn.style.bottom = '250px'; 
                }
            }
        });
      });
      
      observer.observe(dfMessenger, { attributes: true });

      // Lưu lại cleanup function
      dfMessenger._cleanupBot = () => {
        chibi.removeEventListener('click', handleChibiClick);
        observer.disconnect();
      };
    };

    window.addEventListener('dfMessengerLoaded', setupBot);

    // 3. FALLBACK: Đảm bảo 100% Dialogflow được gọi dù event có bị hụt
    const fallbackInterval = setInterval(() => {
        const df = document.querySelector('df-messenger');
        if (df && df.shadowRoot) {
            setupBot();
            clearInterval(fallbackInterval);
        }
    }, 1000);

    return () => {
      window.removeEventListener('dfMessengerLoaded', setupBot);
      clearInterval(fallbackInterval);
      const dfMessenger = document.querySelector('df-messenger');
      if (dfMessenger && dfMessenger._cleanupBot) {
          dfMessenger._cleanupBot();
      }
    };
  }, []);

  const handleChangeAnimation = (e) => {
    e.stopPropagation();
    const nextIndex = (currentAnimIndex + 1) % animationConfigs.length;
    setCurrentAnimIndex(nextIndex);
    
    const config = animationConfigs[nextIndex];
    if (chibiRef.current.getAttribute('src') !== config.file) {
        chibiRef.current.setAttribute('src', config.file);
    }
    chibiRef.current.setAttribute('animation-name', config.name);
  };

  return (
    <>
      <button 
        ref={animBtnRef} 
        id="change-anim-btn" 
        className="change-anim-btn" 
        title="Đổi hành động" 
        onClick={handleChangeAnimation}
      >
        ✨
      </button>

      <model-viewer 
        ref={chibiRef}
        id="chibi-character" 
        className="chibi-character"
        src={animationConfigs[currentAnimIndex].file} 
        alt="Trợ lý 3D" 
        autoplay 
        animation-name={animationConfigs[currentAnimIndex].name} 
        camera-orbit="0deg 75deg 270%"
        max-camera-orbit="auto auto 600%" 
        field-of-view="45deg" 
        camera-target="0m 0.22m 0m" 
        shadow-intensity="0" 
        interaction-prompt="none"
        camera-controls
        disable-zoom
        disable-pan
        disable-tap
      ></model-viewer>

      <df-messenger
        intent="WELCOME"
        chat-title="CeramicShop Chatbot"
        agent-id="6add2f93-9961-40d6-9b52-f4af5862c6a1"
        language-code="vi"
      ></df-messenger>
    </>
  );
}

export default ChatBot;