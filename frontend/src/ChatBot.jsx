import React, { useEffect, useRef, useState } from 'react';
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
  const [currentAnimIndex, setCurrentAnimIndex] = useState(0);
  const [isBubbleHidden, setIsBubbleHidden] = useState(false); 
  const [isChatOpen, setIsChatOpen] = useState(false);

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

    const initInterval = setInterval(() => {
        const df = document.querySelector('df-messenger');
        if (df && df.shadowRoot) {
            if (!df.shadowRoot.querySelector('#custom-hide-style')) {
                const style = document.createElement('style');
                style.id = 'custom-hide-style';
                style.innerHTML = `
                    #widgetIcon { display: none !important; }
                    df-messenger-chat-bubble { display: none !important; }
                    df-messenger-chat {
                        position: absolute !important;
                        bottom: 0 !important;
                        right: 0 !important;
                    }
                `;
                df.shadowRoot.appendChild(style);
            }

            const chatWindow = df.shadowRoot.querySelector('df-messenger-chat');
            if (chatWindow && chatWindow.shadowRoot) {
                const userInput = chatWindow.shadowRoot.querySelector('df-messenger-user-input');
                if (userInput && userInput.shadowRoot && !userInput.hasAttribute('fixed-input')) {
                    const inputStyle = document.createElement('style');
                    inputStyle.innerHTML = `
                        input[type="text"] {
                            height: 48px !important;
                            font-size: 15px !important;
                            padding: 10px 15px !important;
                        }
                    `;
                    userInput.shadowRoot.appendChild(inputStyle);
                    userInput.setAttribute('fixed-input', 'true');
                    clearInterval(initInterval);
                }
            }
        }
    }, 500);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'expand') {
                const dfMessenger = document.querySelector('df-messenger');
                const isExpanded = dfMessenger.hasAttribute('expand') && dfMessenger.getAttribute('expand') !== 'false';
                setIsChatOpen(isExpanded);
                if (isExpanded) {
                    setIsBubbleHidden(true);
                }
            }
        });
    });

    const setupBot = () => {
        const dfMessenger = document.querySelector('df-messenger');
        if (dfMessenger) observer.observe(dfMessenger, { attributes: true });
    };

    window.addEventListener('dfMessengerLoaded', setupBot);

    return () => {
        clearInterval(initInterval);
        observer.disconnect();
        window.removeEventListener('dfMessengerLoaded', setupBot);
    };
  }, []);

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
    const isExpanded = dfMessenger.hasAttribute('expand') && dfMessenger.getAttribute('expand') !== 'false';

    if (!isExpanded) {
        if (chibiRef.current) {
            chibiRef.current.src = '/smile.glb'; 
            chibiRef.current.animationName = 'Laugh01'; 
        }
        if (dfMessenger.shadowRoot && dfMessenger.shadowRoot.querySelector('#widgetIcon')) {
            dfMessenger.shadowRoot.querySelector('#widgetIcon').click();
        } else {
            dfMessenger.setAttribute('expand', 'true');
        }
    } else {
        if (dfMessenger.shadowRoot) {
            const chatWindow = dfMessenger.shadowRoot.querySelector('df-messenger-chat');
            if (chatWindow && chatWindow.shadowRoot) {
                const titleBar = chatWindow.shadowRoot.querySelector('df-messenger-titlebar');
                if (titleBar && titleBar.shadowRoot) {
                    const closeBtn = titleBar.shadowRoot.querySelector('button');
                    if (closeBtn) {
                        closeBtn.click();
                        return;
                    }
                }
            }
        }
        dfMessenger.setAttribute('expand', 'false');
    }
  };

  return (
    <>
      <div id="bot-wrapper" className={`bot-wrapper ${isChatOpen ? 'chat-open' : ''}`}>
          {!isBubbleHidden && (
            <div className="chat-bubble-hint">
              Chào bạn, mình là trợ lý ảo của CeramicShop. Mình có thể giúp gì ạ?
            </div>
          )}
          <button id="change-anim-btn" className="change-anim-btn" title="Đổi hành động" onClick={handleChangeAnimation}>
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
        intent="WELCOME"
        chat-title="CeramicShop Chatbot"
        agent-id="6add2f93-9961-40d6-9b52-f4af5862c6a1"
        language-code="vi"
      ></df-messenger>
    </>
  );
}

export default ChatBot;