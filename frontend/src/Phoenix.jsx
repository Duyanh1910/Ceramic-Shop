import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './Phoenix.module.css';

export default function Phoenix({ mood = 'idle', passwordVisible = false }) {
  const containerRef = useRef(null);
  const [eye, setEye] = useState({ x: 0, y: 0 });
  const [wingPhase, setWingPhase] = useState(0);
  const [tailPhase, setTailPhase] = useState(0);
  const [blinking, setBlinking] = useState(false);

  // Thường khi hiển thị mật khẩu (passwordVisible = true) thì linh vật sẽ che mắt (shy)
  const activeMood = passwordVisible ? 'shy' : mood;

  // Theo dõi chuột
  const onMouseMove = useCallback((e) => {
    if (!containerRef.current || activeMood === 'shy' || activeMood === 'sad') return;
    const r = containerRef.current.getBoundingClientRect();
    const cx = r.left + r.width * 0.5;
    const cy = r.top + r.height * 0.36;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const cap = 8; // Giới hạn di chuyển của tròng mắt
    setEye({
      x: (dx / dist) * Math.min(cap, dist) * 0.6,
      y: (dy / dist) * Math.min(cap, dist) * 0.4
    });
  }, [activeMood]);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [onMouseMove]);

  // Vòng lặp nhịp thở & đập cánh
  useEffect(() => {
    let t = 0, raf;
    const loop = () => {
      t += 0.02;
      setWingPhase(Math.sin(t) * 12);
      setTailPhase(Math.sin(t * 0.7 + 1) * 6);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Vòng lặp chớp mắt ngẫu nhiên
  useEffect(() => {
    const schedule = () => {
      const delay = 2500 + Math.random() * 3000;
      return setTimeout(() => {
        setBlinking(true);
        setTimeout(() => { setBlinking(false); schedule(); }, 150);
      }, delay);
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  // --- LOGIC ANIMATION DỰA TRÊN MOOD ---
  const ex = activeMood === 'shy' || activeMood === 'sad' ? 0 : eye.x;
  const ey = activeMood === 'shy' ? 4 : activeMood === 'sad' ? 3 : eye.y;

  // Mắt nhắm
  const eyeH = blinking ? 0.1 : (activeMood === 'shy' || activeMood === 'happy' ? 0.15 : 1);
  
  // Nhịp cơ thể lên xuống
  const bodyDY = activeMood === 'sad' ? 8 
    : activeMood === 'happy' ? Math.sin(wingPhase * 0.4) * 3 - 3 
    : Math.sin(wingPhase * 0.26) * 2;

  // Góc xoay của cánh (Nếu shy -> Cánh gập vào che mặt)
  const wL = activeMood === 'shy' ? 65 : (activeMood === 'happy' ? wingPhase - 25 : wingPhase - 10);
  const wR = activeMood === 'shy' ? -65 : (activeMood === 'happy' ? -wingPhase + 25 : -wingPhase + 10);

  // Bảng màu
  const P = {
    idle:  { primary: '#d98b38', secondary: '#f7b76d', body: '#1b437c', body2: '#2a5ba3', glow: '217,139,56', beak: '#ffc04d' },
    happy: { primary: '#ffaa33', secondary: '#ffce85', body: '#1b437c', body2: '#3776d6', glow: '255,170,51', beak: '#ffd700' },
    sad:   { primary: '#7a9ebf', secondary: '#a8c6e0', body: '#2a4266', body2: '#3b5c8c', glow: '122,158,191', beak: '#9db5cc' },
    shy:   { primary: '#e87b9b', secondary: '#f4aebd', body: '#1b437c', body2: '#3776d6', glow: '232,123,155', beak: '#ffb3c6' },
  }[activeMood];

  const LABELS = {
    idle:  '👀 Chào bạn, đăng nhập nhé...',
    happy: '🎉 Yeah! Chào mừng trở lại!',
    sad:   '😢 Ối! Sai thông tin rồi...',
    shy:   '🙈 Bí mật nhé, mình không nhìn đâu!',
  };

  return (
    <div ref={containerRef} className={styles.wrapper}>
      {/* Ánh sáng nền */}
      <div className={styles.glow}
        style={{ background: `radial-gradient(ellipse 65% 60% at 50% 50%, rgba(${P.glow},0.3) 0%, transparent 70%)` }} 
      />

      {/* Pháo hoa khi Happy */}
      {activeMood === 'happy' && (
        <div className={styles.sparks} aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className={styles.spark}
              style={{ '--i': i, '--c': i % 2 === 0 ? '#ffb347' : '#fff' }} />
          ))}
        </div>
      )}

      <svg viewBox="0 0 260 340" xmlns="http://www.w3.org/2000/svg" className={styles.svg} aria-hidden>
        <defs>
          <radialGradient id="PbodyA" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor={P.body2} />
            <stop offset="100%" stopColor={P.body} />
          </radialGradient>
          <linearGradient id="PfeathA" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={P.secondary} />
            <stop offset="100%" stopColor={P.primary} />
          </linearGradient>
          <linearGradient id="PtailA" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={P.secondary} stopOpacity="0.9" />
            <stop offset="100%" stopColor={P.primary} stopOpacity="0.7" />
          </linearGradient>
          <filter id="Pshadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.15" />
          </filter>
          <filter id="Psoft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* --- ĐUÔI --- */}
        <g transform={`translate(130 230) rotate(${tailPhase})`} style={{ transformOrigin: '130px 230px' }}>
          {[-30, -15, 0, 15, 30].map((rot, i) => {
            const len = [60, 80, 95, 80, 60][i];
            const rx = [5, 7, 9, 7, 5][i];
            return (
              <g key={i} transform={`rotate(${rot})`}>
                <ellipse cx={0} cy={len / 2} rx={rx} ry={len / 2} fill="url(#PtailA)" filter="url(#Pshadow)" />
                <path d={`M 0 5 Q ${rx} ${len/2} 0 ${len-5}`} fill="none" stroke="#fff" strokeWidth="1" opacity="0.4" />
                <circle cx={0} cy={len - 4} r="3" fill={P.secondary} opacity="0.8" />
              </g>
            );
          })}
        </g>

        {/* --- CƠ THỂ --- */}
        <g style={{ transform: `translateY(${bodyDY}px)`, transition: 'transform 0.3s ease' }}>
          
          {/* Lông mào trên đầu (Crest) */}
          <g transform="translate(130 60)" fill="url(#PfeathA)" filter="url(#Pshadow)">
            <path d="M 0 0 Q -15 -35 -30 -20 Q -10 -15 0 10 Z" />
            <path d="M 0 0 Q 0 -45 5 -40 Q 10 -20 0 10 Z" />
            <path d="M 0 0 Q 15 -35 30 -20 Q 10 -15 0 10 Z" />
          </g>

          {/* Thân */}
          <ellipse cx="130" cy="165" rx="42" ry="55" fill="url(#PbodyA)" filter="url(#Pshadow)" />
          {/* Bụng trắng/vàng nhạt */}
          <ellipse cx="130" cy="175" rx="26" ry="36" fill={P.secondary} opacity="0.2" filter="url(#Psoft)" />

          {/* Đầu */}
          <circle cx="130" cy="100" r="38" fill="url(#PbodyA)" filter="url(#Pshadow)" />
          
          {/* Má hồng (Blush) */}
          {(activeMood === 'happy' || activeMood === 'shy') && (
            <g filter="url(#Psoft)" opacity="0.6">
              <ellipse cx="102" cy="112" rx="10" ry="5" fill="#ff7da3" />
              <ellipse cx="158" cy="112" rx="10" ry="5" fill="#ff7da3" />
            </g>
          )}

          {/* --- MẮT VÀ LÔNG MÀY --- */}
          <g transform="translate(0, -2)">
            {/* Lông mày */}
            <g stroke={P.secondary} strokeWidth="3" strokeLinecap="round" opacity="0.8">
              {activeMood === 'sad' ? (
                <>
                  <path d="M 102 82 L 118 76" />
                  <path d="M 158 82 L 142 76" />
                </>
              ) : activeMood === 'happy' ? (
                <>
                  <path d="M 100 80 Q 110 74 120 80" />
                  <path d="M 160 80 Q 150 74 140 80" />
                </>
              ) : activeMood === 'shy' ? (
                <>
                  <path d="M 102 76 L 118 82" />
                  <path d="M 158 76 L 142 82" />
                </>
              ) : (
                <>
                  <path d="M 100 78 L 118 78" />
                  <path d="M 160 78 L 142 78" />
                </>
              )}
            </g>

            {/* Tròng Trắng */}
            <circle cx="110" cy="94" r="12" fill="#fff" />
            <circle cx="150" cy="94" r="12" fill="#fff" />

            {/* Con ngươi (Đồng tử) */}
            {activeMood === 'happy' ? (
              // Mắt nhắm cười ^ ^
              <g stroke={P.body} strokeWidth="3.5" fill="none" strokeLinecap="round">
                <path d="M 104 96 Q 110 88 116 96" />
                <path d="M 144 96 Q 150 88 156 96" />
              </g>
            ) : (
              // Mắt thường / Buồn / Shy
              <>
                <ellipse cx={110 + ex} cy={94 + ey} rx="6" ry={6 * eyeH} fill={P.body} style={{ transition: 'all 0.1s' }} />
                <ellipse cx={150 + ex} cy={94 + ey} rx="6" ry={6 * eyeH} fill={P.body} style={{ transition: 'all 0.1s' }} />
                {eyeH > 0.5 && (
                  <>
                    <circle cx={108 + ex} cy={92 + ey} r="2.5" fill="#fff" />
                    <circle cx={148 + ex} cy={92 + ey} r="2.5" fill="#fff" />
                  </>
                )}
              </>
            )}
          </g>

          {/* Nước mắt khi Sad */}
          {activeMood === 'sad' && (
            <g fill="#7dd3fc" filter="url(#Psoft)">
              <ellipse cx="110" cy="110" rx="3" ry="6" className={styles.tear} />
              <ellipse cx="150" cy="110" rx="3" ry="6" className={styles.tear} style={{ animationDelay: '0.4s' }} />
            </g>
          )}

          {/* --- MỎ (BEAK) --- */}
          <g transform={`translate(130, 110) scale(${activeMood === 'happy' ? 1.1 : 1})`} style={{ transition: 'transform 0.2s' }}>
            <path d="M -12 0 Q 0 -8 12 0 Q 0 12 -12 0 Z" fill={P.beak} filter="url(#Pshadow)" />
            {activeMood === 'happy' ? (
              <path d="M -8 2 Q 0 12 8 2 Q 0 8 -8 2 Z" fill="#d94b4b" /> // Lưỡi cười
            ) : (
              <path d="M -10 2 Q 0 6 10 2" fill="none" stroke={P.body} strokeWidth="1.5" opacity="0.3" /> // Rãnh mỏ
            )}
          </g>

          {/* --- CÁNH TRÁI --- */}
          <g transform="translate(100 135)">
            <g style={{ transform: `rotate(${wL}deg)`, transformOrigin: 'top right', transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              <path d="M 0 0 C -40 -10 -80 30 -60 80 C -30 90 20 60 20 10 Z" fill="url(#PfeathA)" filter="url(#Pshadow)" />
              <path d="M -10 10 C -40 20 -60 50 -45 75" fill="none" stroke={P.secondary} strokeWidth="2" opacity="0.5" />
            </g>
          </g>

          {/* --- CÁNH PHẢI --- */}
          <g transform="translate(160 135)">
            <g style={{ transform: `rotate(${wR}deg)`, transformOrigin: 'top left', transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              <path d="M 0 0 C 40 -10 80 30 60 80 C 30 90 -20 60 -20 10 Z" fill="url(#PfeathA)" filter="url(#Pshadow)" />
              <path d="M 10 10 C 40 20 60 50 45 75" fill="none" stroke={P.secondary} strokeWidth="2" opacity="0.5" />
            </g>
          </g>

          {/* --- CHÂN --- */}
          <g stroke={P.body} strokeWidth="4" strokeLinecap="round" opacity="0.8">
            <path d="M 115 215 L 110 230 L 100 235 M 110 230 L 115 238 M 110 230 L 120 235" />
            <path d="M 145 215 L 150 230 L 160 235 M 150 230 L 145 238 M 150 230 L 140 235" />
          </g>
          
        </g>
      </svg>

      {/* Khung chat */}
      <div className={`${styles.bubble} ${styles['bubble_' + activeMood]}`} key={activeMood}>
        {LABELS[activeMood]}
      </div>
    </div>
  );
}