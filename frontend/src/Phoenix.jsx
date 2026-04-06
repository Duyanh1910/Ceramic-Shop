import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './Phoenix.module.css';

export default function Phoenix({ mood = 'idle', passwordVisible = false }) {
  const containerRef = useRef(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [wingUp, setWingUp] = useState(false);
  const [tailPhase, setTailPhase] = useState(0);
  const [blinking, setBlinking] = useState(false);

  const activeMood = passwordVisible ? 'shy' : mood;

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.38;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 8;
    const scale = Math.min(1, maxDist / Math.max(dist, 1));
    setEyeOffset({
      x: dx * scale * 0.45,
      y: dy * scale * 0.3,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const interval = setInterval(() => setWingUp((w) => !w), 900);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let frame;
    let t = 0;
    const animate = () => {
      t += 0.025;
      setTailPhase(Math.sin(t) * 6);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    };
    const interval = setInterval(blink, 3500 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, []);

  const ex = eyeOffset.x;
  const ey = eyeOffset.y;
  const eyeScaleY = blinking || activeMood === 'shy' ? 0.05 : activeMood === 'sad' ? 0.6 : 1;

  const wingLeftRot  = activeMood === 'happy' ? -35 : wingUp ? -22 : -10;
  const wingRightRot = activeMood === 'happy' ?  35 : wingUp ?  22 :  10;

  const bodyY = activeMood === 'sad' ? 4 : wingUp ? -3 : 0;

  const featherColor = activeMood === 'sad' ? '#6a8fb5'
    : activeMood === 'happy' ? '#ffb347'
    : activeMood === 'shy'   ? '#e07b9a'
    : '#c48c46';

  const bodyColor = activeMood === 'sad' ? '#4a6fa5' : '#1b437c';
  const glowColor = activeMood === 'sad' ? 'rgba(106,143,181,0.3)'
    : activeMood === 'happy' ? 'rgba(255,179,71,0.4)'
    : activeMood === 'shy'   ? 'rgba(224,123,154,0.3)'
    : 'rgba(196,140,70,0.25)';

  return (
    <div ref={containerRef} className={styles.wrapper}>

      <div className={styles.glowBg} 
      style={{ background: `radial-gradient(circle at 50% 45%, ${glowColor} 0%, transparent 70%)` }} />

      {activeMood === 'happy' && (
        <div className={styles.sparkles}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.sparkle} style={{ '--i': i }} />
          ))}
        </div>
      )}

      <svg
        viewBox="0 0 220 300"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
      >
        <defs>
          <radialGradient id="bodyGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#2d6abf" />
            <stop offset="100%" stopColor={bodyColor} />
          </radialGradient>
          <radialGradient id="featherGrad" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
            <stop offset="100%" stopColor={featherColor} />
          </radialGradient>
          <radialGradient id="eyeGrad" cx="35%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#e8f0fe" />
          </radialGradient>
          <filter id="softShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#00000033" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g transform={`translate(110,215) rotate(${tailPhase})`} style={{ transformOrigin: '110px 215px' }}>
          <ellipse cx="0" cy="38" rx="8" ry="38" fill="url(#featherGrad)" opacity="0.9" />
          <ellipse cx="-18" cy="32" rx="6" ry="32" fill={featherColor} opacity="0.75"
            transform="rotate(-18, -18, 32)" />
          <ellipse cx="-34" cy="22" rx="5" ry="24" fill={featherColor} opacity="0.55"
            transform="rotate(-32, -34, 22)" />
          <ellipse cx="18" cy="32" rx="6" ry="32" fill={featherColor} opacity="0.75"
            transform="rotate(18, 18, 32)" />
          <ellipse cx="34" cy="22" rx="5" ry="24" fill={featherColor} opacity="0.55"
            transform="rotate(32, 34, 22)" />
          <circle cx="0" cy="76" r="5" fill="#fff" opacity="0.6" filter="url(#glow)" />
          <circle cx="-28" cy="58" r="3.5" fill="#fff" opacity="0.4" filter="url(#glow)" />
          <circle cx="28" cy="58" r="3.5" fill="#fff" opacity="0.4" filter="url(#glow)" />
        </g>

        <g transform={`translate(110,155)`} style={{ transformOrigin: '110px 155px' }}>
          <path
            d={`M 0 0 C -45 -15 -75 ${wingLeftRot * 1.5} -65 30 C -50 55 -20 45 0 30`}
            fill={featherColor}
            opacity="0.85"
            filter="url(#softShadow)"
            style={{ transition: 'all 0.4s ease' }}
          />
          <path d={`M -10 5 C -40 -8 -62 ${wingLeftRot * 1.2} -55 28`}
            fill="none" stroke="#fff" strokeWidth="1" opacity="0.4" />
          <path d={`M -5 8 C -32 0 -50 ${wingLeftRot} -42 25`}
            fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.3" />
        </g>

        <g transform={`translate(110,155)`} style={{ transformOrigin: '110px 155px' }}>
          <path
            d={`M 0 0 C 45 -15 75 ${wingRightRot * 1.5} 65 30 C 50 55 20 45 0 30`}
            fill={featherColor}
            opacity="0.85"
            filter="url(#softShadow)"
            style={{ transition: 'all 0.4s ease' }}
          />
          <path d={`M 10 5 C 40 -8 62 ${wingRightRot * 1.2} 55 28`}
            fill="none" stroke="#fff" strokeWidth="1" opacity="0.4" />
          <path d={`M 5 8 C 32 0 50 ${wingRightRot} 42 25`}
            fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.3" />
        </g>

        <g style={{ transform: `translateY(${bodyY}px)`, transition: 'transform 0.35s ease' }}>

          <ellipse cx="110" cy="165" rx="38" ry="52"
            fill="url(#bodyGrad)" filter="url(#softShadow)" />

          <ellipse cx="110" cy="175" rx="22" ry="30"
            fill="#fff" opacity="0.12" />

          <ellipse cx="110" cy="118" rx="16" ry="24"
            fill="url(#bodyGrad)" />

          <circle cx="110" cy="96" r="32"
            fill="url(#bodyGrad)" filter="url(#softShadow)" />

          <path d="M 100 68 C 96 50 90 36 88 28 C 92 38 98 52 100 68" fill={featherColor} />
          <path d="M 110 65 C 108 47 106 30 108 18 C 110 30 112 47 110 65" fill={featherColor} />
          <path d="M 120 68 C 122 50 130 36 132 28 C 128 38 122 52 120 68" fill={featherColor} />
          <circle cx="88" cy="26" r="4" fill="#fff" opacity="0.7" filter="url(#glow)" />
          <circle cx="108" cy="16" r="4.5" fill="#fff" opacity="0.8" filter="url(#glow)" />
          <circle cx="132" cy="26" r="4" fill="#fff" opacity="0.7" filter="url(#glow)" />

          <path d="M 122 98 C 135 95 142 102 138 107 C 132 112 122 107 122 102 Z"
            fill="#e8aa50" />
          <path d="M 122 103 C 132 105 138 107 138 107 C 132 112 122 107 122 103 Z"
            fill="#c48c46" opacity="0.6" />

          {activeMood === 'sad' && (
            <>
              <line x1="88" y1="76" x2="102" y2="80" stroke="#4a6fa5" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="118" y1="80" x2="130" y2="76" stroke="#4a6fa5" strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}

          {activeMood === 'shy' && (
            <>
              <path d="M 72 88 C 80 75 95 72 100 80 C 95 78 80 80 72 88 Z"
                fill={featherColor} opacity="0.95" />
              <path d="M 148 88 C 140 75 125 72 120 80 C 125 78 140 80 148 88 Z"
                fill={featherColor} opacity="0.95" />
            </>
          )}

          <g>
            <circle cx="95" cy="90" r="10" fill="url(#eyeGrad)" />
            <circle cx="95" cy="90" r="10" fill="none" stroke="#173354" strokeWidth="1.5" />
            <ellipse
              cx={95 + ex}
              cy={90 + ey}
              rx={4.5}
              ry={4.5 * eyeScaleY}
              fill="#173354"
              style={{ transition: 'ry 0.12s ease, cx 0.05s ease, cy 0.05s ease' }}
            />
            <circle cx={92 + ex * 0.3} cy={87 + ey * 0.3} r="1.8" fill="#fff" opacity="0.9" />
          </g>

          <g>
            <circle cx="125" cy="90" r="10" fill="url(#eyeGrad)" />
            <circle cx="125" cy="90" r="10" fill="none" stroke="#173354" strokeWidth="1.5" />
            <ellipse
              cx={125 + ex}
              cy={90 + ey}
              rx={4.5}
              ry={4.5 * eyeScaleY}
              fill="#173354"
              style={{ transition: 'ry 0.12s ease, cx 0.05s ease, cy 0.05s ease' }}
            />
            <circle cx={122 + ex * 0.3} cy={87 + ey * 0.3} r="1.8" fill="#fff" opacity="0.9" />
          </g>

          {(activeMood === 'happy' || activeMood === 'shy') && (
            <>
              <ellipse cx="85" cy="100" rx="8" ry="5" fill="#ffb3c6" opacity="0.5" />
              <ellipse cx="135" cy="100" rx="8" ry="5" fill="#ffb3c6" opacity="0.5" />
            </>
          )}

          {activeMood === 'sad' && (
            <>
              <ellipse cx="88" cy="105" rx="2.5" ry="4" fill="#6ab3e8" opacity="0.7" className={styles.tear} />
              <ellipse cx="129" cy="105" rx="2.5" ry="4" fill="#6ab3e8" opacity="0.7" className={styles.tear} />
            </>
          )}

          {activeMood === 'happy' && (
            <path d="M 100 110 Q 110 120 120 110" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          )}
          {activeMood === 'sad' && (
            <path d="M 100 116 Q 110 108 120 116" fill="none" stroke="#8ab" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          )}

          <g opacity="0.7">
            <line x1="98" y1="215" x2="90" y2="235" stroke={bodyColor} strokeWidth="3" strokeLinecap="round" />
            <line x1="90" y1="235" x2="82" y2="240" stroke={bodyColor} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="90" y1="235" x2="90" y2="243" stroke={bodyColor} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="90" y1="235" x2="98" y2="240" stroke={bodyColor} strokeWidth="2.5" strokeLinecap="round" />

            <line x1="122" y1="215" x2="130" y2="235" stroke={bodyColor} strokeWidth="3" strokeLinecap="round" />
            <line x1="130" y1="235" x2="122" y2="240" stroke={bodyColor} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="130" y1="235" x2="130" y2="243" stroke={bodyColor} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="130" y1="235" x2="138" y2="240" stroke={bodyColor} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </g>
      </svg>

      <div className={styles.moodBubble}>
        {activeMood === 'idle'   && '👀 Nhìn bạn kìa...'}
        {activeMood === 'happy'  && '🎉 Chào mừng trở lại!'}
        {activeMood === 'sad'    && '😢 Sai mật khẩu rồi...'}
        {activeMood === 'shy'    && '🙈 Mình không nhìn đâu!'}
      </div>
    </div>
  );
}
