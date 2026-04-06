import React, { useState } from 'react';
import styles from './ContactIcons.module.css';

const CONTACTS = [
  {
    key: 'zalo',
    href: 'https://zalo.me/0329835725',
    label: 'Chat Zalo',
    external: true,
    icon: (
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" 
        alt="Zalo" 
        className={styles.imgIcon} 
      />
    ),
  },
  {
    key: 'facebook',
    href: 'https://www.facebook.com/tran.duy.anh.714185',
    label: 'Facebook',
    external: true,
    icon: (
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" 
        alt="Facebook" 
        className={styles.imgIcon} 
      />
    ),
  },
  {
    key: 'email',
    href: 'mailto:theceramicshop24@gmail.com',
    label: 'Gửi Email',
    external: false,
    icon: (
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" 
        alt="Gmail" 
        className={styles.imgIcon} 
      />
    ),
  },
  {
    key: 'phone',
    href: 'tel:0329835725',
    label: '0329.835.725',
    external: false,
    icon: (
      <div className={styles.phoneIconWrap}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
        </svg>
      </div>
    ),
  },
];

export default function ContactIcons() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`${styles.wrapper} ${open ? styles.open : ''}`}>
      <div className={styles.menuContainer}>
        {CONTACTS.map((c, i) => (
          <a
            key={c.key}
            href={c.href}
            target={c.external ? '_blank' : undefined}
            rel={c.external ? 'noopener noreferrer' : undefined}
            className={styles.item}
            style={{ '--delay': `${(CONTACTS.length - i) * 0.06}s` }}
            title={c.label}
          >
            <div className={styles.iconCircle}>
              {c.icon}
            </div>
            <span className={styles.tooltip}>{c.label}</span>
          </a>
        ))}
      </div>

      <button className={styles.toggleBtn} onClick={() => setOpen((p) => !p)}>
        <div className={styles.pulseEffect}></div>
        {open ? (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <PhoneRingIcon />
        )}
      </button>
    </div>
  );
}

function PhoneRingIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff" className={styles.phoneRing}>
      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
    </svg>
  );
}