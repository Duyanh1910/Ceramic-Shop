import React, { useState } from 'react';
import styles from './ContactIcons.module.css';

const CONTACTS = [
  {
    key: 'zalo',
    href: 'https://zalo.me/0329835725',
    label: 'Zalo',
    external: true,
    color: '#0068FF',
    bg: '#e8f0ff',
    icon: (
      <svg viewBox="0 0 48 48" width="22" height="22">
        <rect width="48" height="48" rx="12" fill="#0068FF"/>
        <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle"
          fill="white" fontSize="18" fontWeight="bold" fontFamily="Arial">Z</text>
      </svg>
    ),
  },
  {
    key: 'facebook',
    href: 'https://www.facebook.com/tran.duy.anh.714185',
    label: 'Facebook',
    external: true,
    color: '#1877F2',
    bg: '#e8f0ff',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    key: 'email',
    href: 'mailto:theceramicshop24@gmail.com',
    label: 'Email',
    external: false,
    color: '#EA4335',
    bg: '#ffecea',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
      </svg>
    ),
  },
  {
    key: 'phone',
    href: 'tel:0329835725',
    label: '0329 835 725',
    external: false,
    color: '#00B14F',
    bg: '#e8fff3',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#00B14F">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
      </svg>
    ),
  },
];

export default function ContactIcons() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`${styles.wrapper} ${open ? styles.open : ''}`}>
      {CONTACTS.map((c, i) => (
        <a
          key={c.key}
          href={c.href}
          target={c.external ? '_blank' : undefined}
          rel={c.external ? 'noopener noreferrer' : undefined}
          className={styles.item}
          style={{ '--delay': `${i * 0.05}s` }}
          title={c.label}
          onClick={c.key === 'phone' ? undefined : undefined}
        >
          <div className={styles.iconCircle} style={{ background: c.bg, boxShadow: `0 4px 12px ${c.color}33` }}>
            {c.icon}
          </div>
          <span className={styles.tooltip} style={{ color: c.color }}>{c.label}</span>
        </a>
      ))}

      <button className={styles.toggleBtn} onClick={() => setOpen((p) => !p)}>
        {open ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <PhoneRingIcon />
        )}
        {!open && <span className={styles.toggleLabel}>Liên hệ</span>}
      </button>
    </div>
  );
}

function PhoneRingIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="white" className={styles.phoneRing}>
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
    </svg>
  );
}
