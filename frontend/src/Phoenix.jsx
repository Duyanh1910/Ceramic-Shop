import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './Phoenix.module.css';

export default function Phoenix({ mood = 'idle', passwordVisible = false }) {
  const containerRef = useRef(null);
  const [eye, setEye]         = useState({ x: 0, y: 0 });
  const [wingPhase, setWingPhase] = useState(0);
  const [tailPhase, setTailPhase] = useState(0);
  const [blinking, setBlinking]   = useState(false);

  const activeMood = passwordVisible ? 'shy' : mood;

  const onMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const r  = containerRef.current.getBoundingClientRect();
    const cx = r.left + r.width  * 0.5;
    const cy = r.top  + r.height * 0.36;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const cap  = 7;
    setEye({ x: (dx / dist) * Math.min(cap, dist) * 0.5,
             y: (dy / dist) * Math.min(cap, dist) * 0.3 });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [onMouseMove]);

  useEffect(() => {
    let t = 0, raf;
    const loop = () => {
      t += 0.018;
      setWingPhase(Math.sin(t) * 12);
      setTailPhase(Math.sin(t * 0.7 + 1) * 5);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const schedule = () => {
      const delay = 3000 + Math.random() * 2000;
      return setTimeout(() => {
        setBlinking(true);
        setTimeout(() => { setBlinking(false); schedule(); }, 130);
      }, delay);
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  const ex = eye.x;
  const ey = eye.y;

  const eyeH = blinking || activeMood === 'shy'
    ? 0.06
    : activeMood === 'sad' ? 0.55 : 1;

  const bodyDY = activeMood === 'sad' ? 5
    : activeMood === 'happy' ? Math.sin(wingPhase * 0.3) * 2 - 2
    : Math.sin(wingPhase * 0.26) * 1.5;

  const P = {
    idle:  { primary: '#c48c46', secondary: '#e8aa6e', body: '#1b437c', body2: '#2d6abf', glow: '196,140,70' },
    happy: { primary: '#ffb347', secondary: '#ffd580', body: '#1b437c', body2: '#3d7fd4', glow: '255,179,71' },
    sad:   { primary: '#6a8fb5', secondary: '#90afc8', body: '#344f7a', body2: '#4a6fa5', glow: '106,143,181' },
    shy:   { primary: '#e07b9a', secondary: '#f0a8bf', body: '#1b437c', body2: '#3060a8', glow: '224,123,154' },
  }[activeMood] || { primary: '#c48c46', secondary: '#e8aa6e', body: '#1b437c', body2: '#2d6abf', glow: '196,140,70' };

  const wL = activeMood === 'happy' ? wingPhase - 18 : wingPhase - 8;
  const wR = activeMood === 'happy' ? -wingPhase + 18 : -wingPhase + 8;

  const LABELS = {
    idle:  '👀 Nhìn bạn kìa...',
    happy: '🎉 Chào mừng trở lại!',
    sad:   '😢 Sai mật khẩu rồi...',
    shy:   '🙈 Mình không nhìn đâu!',
  };

  return (
    <div ref={containerRef} className={styles.wrapper}>

      <div className={styles.glow}
        style={{ background: `radial-gradient(ellipse 70% 60% at 50% 48%, rgba(${P.glow},0.28) 0%, transparent 70%)` }} />

      {activeMood === 'happy' && (
        <div className={styles.sparks} aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className={styles.spark}
              style={{ '--i': i, '--c': i % 3 === 0 ? '#ffb347' : i % 3 === 1 ? '#fff' : '#c48c46' }} />
          ))}
        </div>
      )}

      <svg viewBox="0 0 260 340" xmlns="http://www.w3.org/2000/svg"
        className={styles.svg} aria-hidden>
        <defs>
          <radialGradient id="PbodyA" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor={P.body2} />
            <stop offset="100%" stopColor={P.body} />
          </radialGradient>
          <radialGradient id="PeyeA" cx="30%" cy="28%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#ddeeff" />
          </radialGradient>
          <linearGradient id="PfeathA" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={P.secondary} />
            <stop offset="100%" stopColor={P.primary} />
          </linearGradient>
          <linearGradient id="PtailA" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={P.secondary} stopOpacity="0.9" />
            <stop offset="100%" stopColor={P.primary} stopOpacity="0.6" />
          </linearGradient>
          <filter id="Pshadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor={P.body} floodOpacity="0.25" />
          </filter>
          <filter id="Pglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="Psoft" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <g transform={`translate(130 240) rotate(${tailPhase})`}
          style={{ transformOrigin: '130px 240px' }}>
          {[0,-14,-26,14,26].map((ox, i) => {
            const len  = [80, 68, 52, 68, 52][i];
            const rot  = [0,-14,-26,14,26][i];
            const opa  = [0.92, 0.78, 0.55, 0.78, 0.55][i];
            const rx   = [7,5.5,4,5.5,4][i];
            return (
              <g key={i} transform={`rotate(${rot})`}>
                <ellipse cx={ox} cy={len / 2} rx={rx} ry={len / 2}
                  fill="url(#PtailA)" opacity={opa} />
                <line x1={ox} y1={4} x2={ox} y2={len - 6}
                  stroke={P.secondary} strokeWidth="0.8" opacity="0.5" />
                <circle cx={ox} cy={len} r="4.5" fill="#fff" opacity="0.65"
                  filter="url(#Pglow)" />
              </g>
            );
          })}
        </g>

        <g style={{ transform: `translateY(${bodyDY}px)`, transition: 'transform 0.3s ease' }}>

          <g transform="translate(130 165)" style={{ transformOrigin: '0 0' }}>
            <g style={{ transform: `rotate(${wL}deg)`, transformOrigin: '0 0',
                        transition: 'transform 0.35s ease' }}>
              <path d="M 0 0 C -28 -10 -70 8 -80 50 C -65 70 -30 62 0 38"
                fill="url(#PfeathA)" opacity="0.9" filter="url(#Pshadow)" />
              <path d="M -4 4 C -24 0 -55 20 -60 52" fill="none"
                stroke={P.secondary} strokeWidth="1.2" opacity="0.45" />
              <path d="M -8 8 C -20 6 -42 28 -45 50" fill="none"
                stroke={P.secondary} strokeWidth="0.9" opacity="0.3" />
              <path d="M -72 44 C -85 30 -92 18 -88 8" fill="none"
                stroke={P.primary} strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
              <path d="M -68 50 C -82 40 -90 32 -86 22" fill="none"
                stroke={P.secondary} strokeWidth="1" opacity="0.35" strokeLinecap="round" />
            </g>
          </g>

          <g transform="translate(130 165)" style={{ transformOrigin: '0 0' }}>
            <g style={{ transform: `rotate(${wR}deg)`, transformOrigin: '0 0',
                        transition: 'transform 0.35s ease' }}>
              <path d="M 0 0 C 28 -10 70 8 80 50 C 65 70 30 62 0 38"
                fill="url(#PfeathA)" opacity="0.9" filter="url(#Pshadow)" />
              <path d="M 4 4 C 24 0 55 20 60 52" fill="none"
                stroke={P.secondary} strokeWidth="1.2" opacity="0.45" />
              <path d="M 8 8 C 20 6 42 28 45 50" fill="none"
                stroke={P.secondary} strokeWidth="0.9" opacity="0.3" />
              <path d="M 72 44 C 85 30 92 18 88 8" fill="none"
                stroke={P.primary} strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
              <path d="M 68 50 C 82 40 90 32 86 22" fill="none"
                stroke={P.secondary} strokeWidth="1" opacity="0.35" strokeLinecap="round" />
            </g>
          </g>

          <ellipse cx="130" cy="170" rx="36" ry="50"
            fill="url(#PbodyA)" filter="url(#Pshadow)" />
          <ellipse cx="130" cy="178" rx="20" ry="28" fill="#fff" opacity="0.1" />

          <path d="M 116 128 C 114 108 120 98 130 92 C 140 98 146 108 144 128 Z"
            fill="url(#PbodyA)" />

          <circle cx="130" cy="90" r="34" fill="url(#PbodyA)" filter="url(#Pshadow)" />
          <ellipse cx="118" cy="78" rx="14" ry="10" fill="#fff" opacity="0.08" />

          {[
            { x: 117, cp1x: 111, cp1y: 58, cp2x: 107, cp2y: 42, ex: 105, ey: 32 },
            { x: 130, cp1x: 128, cp1y: 55, cp2x: 128, cp2y: 36, ex: 130, ey: 24 },
            { x: 143, cp1x: 149, cp1y: 58, cp2x: 153, cp2y: 42, ex: 155, ey: 32 },
          ].map((f, i) => (
            <g key={i}>
              <path d={`M ${f.x} 68 C ${f.cp1x} ${f.cp1y} ${f.cp2x} ${f.cp2y} ${f.ex} ${f.ey}`}
                fill="none" stroke="url(#PfeathA)" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx={f.ex} cy={f.ey} r="4.5" fill={P.secondary} opacity="0.9"
                filter="url(#Pglow)" />
              <circle cx={f.ex} cy={f.ey} r="2" fill="#fff" opacity="0.85" />
            </g>
          ))}

          <path d="M 148 92 C 160 88 170 95 165 102 C 158 109 148 103 148 96 Z"
            fill="#e8aa50" />
          <path d="M 148 97 C 158 99 165 102 165 102 C 158 109 148 103 148 97 Z"
            fill="#c48c46" opacity="0.7" />
          <ellipse cx="157" cy="93" rx="2" ry="1.2" fill={P.body} opacity="0.4" />

          {activeMood === 'sad' && (
            <>
              <path d="M 106 74 C 112 70 118 72 122 76"
                fill="none" stroke={P.primary} strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 138 76 C 142 72 148 70 154 74"
                fill="none" stroke={P.primary} strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}

          {activeMood === 'shy' && (
            <>
              <path d="M 88 96 C 88 78 100 70 110 76 C 104 78 94 84 88 96 Z"
                fill={P.primary} opacity="0.95" />
              <path d="M 172 96 C 172 78 160 70 150 76 C 156 78 166 84 172 96 Z"
                fill={P.primary} opacity="0.95" />
            </>
          )}

          <g>
            <circle cx="112" cy="88" r="11" fill="url(#PeyeA)" />
            <circle cx="112" cy="88" r="11" fill="none" stroke={P.body} strokeWidth="1.8" />
            <ellipse cx={112 + ex} cy={88 + ey} rx="5" ry={5 * eyeH}
              fill={P.body}
              style={{ transition: 'ry 0.1s ease' }} />
            {eyeH > 0.3 && (
              <circle cx={109 + ex * 0.25} cy={85 + ey * 0.25} r="2" fill="#fff" opacity="0.95" />
            )}
          </g>

          <g>
            <circle cx="143" cy="88" r="11" fill="url(#PeyeA)" />
            <circle cx="143" cy="88" r="11" fill="none" stroke={P.body} strokeWidth="1.8" />
            <ellipse cx={143 + ex} cy={88 + ey} rx="5" ry={5 * eyeH}
              fill={P.body}
              style={{ transition: 'ry 0.1s ease' }} />
            {eyeH > 0.3 && (
              <circle cx={140 + ex * 0.25} cy={85 + ey * 0.25} r="2" fill="#fff" opacity="0.95" />
            )}
          </g>

          {(activeMood === 'happy' || activeMood === 'shy') && (
            <>
              <ellipse cx="100" cy="100" rx="10" ry="6" fill="#ffb3c6" opacity="0.45" filter="url(#Psoft)" />
              <ellipse cx="160" cy="100" rx="10" ry="6" fill="#ffb3c6" opacity="0.45" filter="url(#Psoft)" />
            </>
          )}

          {activeMood === 'sad' && (
            <>
              <ellipse cx="106" cy="104" rx="2.5" ry="5"
                fill="#6ab3e8" opacity="0.75" className={styles.tear} />
              <ellipse cx="150" cy="104" rx="2.5" ry="5"
                fill="#6ab3e8" opacity="0.75" className={styles.tear} style={{ animationDelay: '0.3s' }} />
            </>
          )}

          {activeMood === 'happy' && (
            <path d="M 118 108 Q 130 118 142 108"
              fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          )}
          {activeMood === 'sad' && (
            <path d="M 118 113 Q 130 106 142 113"
              fill="none" stroke={P.secondary} strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
          )}

          <g opacity="0.65">
            {[[-12, 12], [12, -12]].map(([lx, rx], i) => (
              <g key={i} transform={`translate(${i === 0 ? 118 : 142} 218)`}>
                <line x1="0" y1="0" x2={lx} y2="24" stroke={P.body} strokeWidth="3.5" strokeLinecap="round" />
                <line x1={lx} y1="24" x2={lx - 10} y2="30" stroke={P.body} strokeWidth="2.5" strokeLinecap="round" />
                <line x1={lx} y1="24" x2={lx}       y2="32" stroke={P.body} strokeWidth="2.5" strokeLinecap="round" />
                <line x1={lx} y1="24" x2={lx + 10} y2="30" stroke={P.body} strokeWidth="2.5" strokeLinecap="round" />
              </g>
            ))}
          </g>

          <path d="M 116 198 C 122 192 130 190 138 192 C 132 200 128 202 130 210 C 128 204 120 202 116 198 Z"
            fill={P.secondary} opacity="0.35" />

        </g>
      </svg>

      <div className={`${styles.bubble} ${styles['bubble_' + activeMood]}`}
        key={activeMood}>
        {LABELS[activeMood]}
      </div>

    </div>
  );
}

const LABELS = {
  idle:  '👀 Nhìn bạn kìa...',
  happy: '🎉 Chào mừng trở lại!',
  sad:   '😢 Sai mật khẩu rồi...',
  shy:   '🙈 Mình không nhìn đâu!',
};