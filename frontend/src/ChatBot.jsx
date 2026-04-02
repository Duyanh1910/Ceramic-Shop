import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  const navigate = useNavigate();
  const chibiRef = useRef(null);
  const [currentAnimIndex, setCurrentAnimIndex] = useState(0);
  const [isBubbleHidden, setIsBubbleHidden] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [maKhachHang, setMaKhachHang] = useState(null);

  const [sessionId] = useState(() => {
      let sid = sessionStorage.getItem('ceramic_df_session');
      if (!sid) {
          sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          sessionStorage.setItem('ceramic_df_session', sid);
      }
      return sid;
  });

  useEffect(() => {
    const fetchMaKH = async () => {
        try {
            const res = await axios.get('https://ceramic-shop-u8ak.onrender.com/api/v1/auth/me', { withCredentials: true });
            const userData = res.data.user || res.data.result;
            const profileData = userData?.profile || userData;

            const actualMaKH = profileData?.MaKhachHang || profileData?.maKhachHang || userData?.MaKhachHang || userData?.maKhachHang || userData?.MaTaiKhoan || userData?.id || null;

            if (actualMaKH && String(actualMaKH) !== String(maKhachHang)) {
                setMaKhachHang(actualMaKH);
                localStorage.setItem("customer_maKhachHang", String(actualMaKH));
            }
        } catch (e) {
        }
    };

    const checkLogin = () => {
      const isActive = localStorage.getItem("customer_session_active");
      if (isActive === "true") {
          let maKH = localStorage.getItem("customer_maKhachHang");
          if (maKH === "null" || maKH === "undefined" || maKH === "") {
              maKH = null;
          }

          if (maKH) {
              if (String(maKH) !== String(maKhachHang)) {
                  setMaKhachHang(maKH);
              }
          } else {
              fetchMaKH();
          }
      } else {
          if (maKhachHang !== null) setMaKhachHang(null);
      }
    };

    checkLogin();
    const interval = setInterval(checkLogin, 1500);
    return () => clearInterval(interval);
  }, [maKhachHang]);

  useEffect(() => {
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

    const nukeInterval = setInterval(() => {
        const dfMessenger = document.querySelector('df-messenger');
        if (dfMessenger?.shadowRoot) {
            if (!dfMessenger.shadowRoot.querySelector('#nuke-bubble-style')) {
                const style = document.createElement('style');
                style.id = 'nuke-bubble-style';
                style.innerHTML = `
                    df-messenger-chat-bubble, #widgetIcon, button[id="widgetIcon"] {
                        display: none !important;
                        visibility: hidden !important;
                        opacity: 0 !important;
                        pointer-events: none !important;
                        width: 0 !important;
                        height: 0 !important;
                        position: absolute !important;
                        z-index: -9999 !important;
                    }
                `;
                dfMessenger.shadowRoot.appendChild(style);
            }

            if (!dfMessenger.classList.contains('df-ready')) {
                dfMessenger.classList.add('df-ready');
            }
        }
    }, 50);

    const initInterval = setInterval(() => {
        const userInput = document.querySelector('df-messenger')
            ?.shadowRoot?.querySelector('df-messenger-chat')
            ?.shadowRoot?.querySelector('df-messenger-user-input');

        if (userInput && !userInput.hasAttribute('fixed-input')) {
            const inputStyle = document.createElement('style');
            inputStyle.innerHTML = `
                input[type="text"] { height: 48px !important; font-size: 15px !important; padding: 10px 15px !important; }
            `;
            userInput.shadowRoot.appendChild(inputStyle);
            userInput.setAttribute('fixed-input', 'true');
            clearInterval(initInterval);
        }
    }, 500);

    const observer = new MutationObserver(() => {
        const df = document.querySelector('df-messenger');
        if (df) {
            const isExpanded = df.getAttribute('expand') === 'true';
            setIsChatOpen(isExpanded);
            if (isExpanded) setIsBubbleHidden(true);
        }
    });

    const observerInterval = setInterval(() => {
        const df = document.querySelector('df-messenger');
        if (df) {
            observer.observe(df, { attributes: true, attributeFilter: ['expand'] });
            clearInterval(observerInterval);
        }
    }, 500);

    return () => {
        clearInterval(nukeInterval);
        clearInterval(initInterval);
        clearInterval(observerInterval);
        observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e) => {
        const path = e.composedPath();
        const anchor = path.find(el => el.tagName === 'A');
        const isInsideBot = path.some(el => el?.tagName === 'DF-MESSENGER');

        if (isInsideBot && anchor && anchor.href) {
            try {
                const urlObj = new URL(anchor.href);

                if (urlObj.origin === window.location.origin) {
                    e.preventDefault();

                    navigate(urlObj.pathname + urlObj.search);

                    const dfMessenger = document.querySelector('df-messenger');
                    if (dfMessenger) {
                        dfMessenger.setAttribute('expand', 'false');
                    }
                    if (chibiRef.current) {
                        chibiRef.current.src = animationConfigs[0].file;
                        chibiRef.current.animationName = animationConfigs[0].name;
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    document.addEventListener('click', handleGlobalClick, true);

    return () => {
        document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [navigate]);

  const handleChangeAnimation = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextIndex = (currentAnimIndex + 1) % animationConfigs.length;
    setCurrentAnimIndex(nextIndex);
    if (chibiRef.current) {
        chibiRef.current.src = animationConfigs[nextIndex].file;
        chibiRef.current.animationName = animationConfigs[nextIndex].name;
    }
  };

  const handleChibiClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dfMessenger = document.querySelector('df-messenger');
    if (!dfMessenger) return;

    const isExpanded = dfMessenger.getAttribute('expand') === 'true';

    if (!isExpanded) {
        if (chibiRef.current) {
            chibiRef.current.src = '/smile.glb';
            chibiRef.current.animationName = 'Laugh01';
        }
        dfMessenger.setAttribute('expand', 'true');
    } else {
        if (chibiRef.current) {
            chibiRef.current.src = animationConfigs[0].file;
            chibiRef.current.animationName = animationConfigs[0].name;
        }
        dfMessenger.setAttribute('expand', 'false');
    }
  };

  const queryParams = JSON.stringify({
      payload: { maKhachHang: maKhachHang }
  });

  return (
    <>
      <div id="bot-wrapper" className={`bot-wrapper ${isChatOpen ? 'chat-open' : ''}`}>
          {!isBubbleHidden && (
            <div className="chat-bubble-hint">
              Chào bạn, mình là trợ lý ảo của CeramicShop. Mình có thể giúp gì ạ?
            </div>
          )}
          <button id="change-anim-btn" className="change-anim-btn" onClick={handleChangeAnimation}>
            ✨
          </button>
          <model-viewer
            ref={chibiRef}
            id="chibi-character"
            className="chibi-character"
            src={animationConfigs[currentAnimIndex].file}
            autoplay
            animation-name={animationConfigs[currentAnimIndex].name}
            camera-orbit="0deg 75deg 270%"
            max-camera-orbit="auto auto 600%"
            field-of-view="45deg"
            camera-target="0m 0.22m 0m"
            shadow-intensity="0"
            interaction-prompt="none"
            camera-controls
            disable-zoom disable-pan disable-tap
            onClick={handleChibiClick}
          ></model-viewer>
      </div>
      <df-messenger
        key={maKhachHang || 'guest'}
        intent="WELCOME"
        wait-open="true"
        chat-title="CeramicShop Chatbot"
        agent-id="6add2f93-9961-40d6-9b52-f4af5862c6a1"
        language-code="vi"
        session-id={sessionId}
        user-id={maKhachHang ? String(maKhachHang) : ''}
        query-parameters={queryParams}
      ></df-messenger>
    </>
  );
}

export default ChatBot;