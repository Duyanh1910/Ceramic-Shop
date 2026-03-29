import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
const DEFAULT_EXPIRE_DAYS = 1;

const REMEMBER_ME_DAYS = 30;

const CHECK_INTERVAL_MS = 60 * 1000;

const TOKEN_EXPIRY_KEY = 'token_expiry';
const REMEMBER_ME_KEY = 'remember_me';

export function saveSession(token, username, role, rememberMe) {
  const days = rememberMe ? REMEMBER_ME_DAYS : DEFAULT_EXPIRE_DAYS;
  const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
  localStorage.setItem('role', role);
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiry));
  localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? '1' : '0');
}

export function clearSession() {
  ['token', 'username', 'role', TOKEN_EXPIRY_KEY, REMEMBER_ME_KEY].forEach(
    (k) => localStorage.removeItem(k)
  );
}

export function isSessionValid() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  const expiry = Number(localStorage.getItem(TOKEN_EXPIRY_KEY));
  if (!expiry) return true;
  return Date.now() < expiry;
}

export function useAutoLogout() {
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const logout = useCallback(() => {
    clearSession();
    message.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', 5);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem('token')) return;

    if (!isSessionValid()) {
      logout();
      return;
    }

    intervalRef.current = setInterval(() => {
      if (!isSessionValid()) logout();
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, [logout]);
}
