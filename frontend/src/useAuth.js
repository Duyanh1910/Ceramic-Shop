import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

const DEFAULT_EXPIRE_DAYS = 1;
const REMEMBER_ME_DAYS = 30;
const CHECK_INTERVAL_MS = 60 * 1000;

const TOKEN_EXPIRY_KEY = 'token_expiry';
const REMEMBER_ME_KEY = 'remember_me';
const SESSION_ACTIVE_KEY = 'session_active';

export function saveSession(username, role, rememberMe) {
  const days = rememberMe ? 30 : 1;
  const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
  
  const prefix = (role === 'Admin' || role === 'Staff') ? 'admin_' : 'customer_';
  
  localStorage.setItem(prefix + 'username', username);
  localStorage.setItem(prefix + 'role', role);
  localStorage.setItem(prefix + 'token_expiry', String(expiry));
  localStorage.setItem(prefix + 'session_active', 'true');
}

export function clearSession(isAdmin = false) {
  const prefix = isAdmin ? 'admin_' : 'customer_';
  [prefix + 'username', prefix + 'role', prefix + 'token_expiry', prefix + 'session_active'].forEach(
    (k) => localStorage.removeItem(k)
  );
}

export function isSessionValid() {
  const isActive = localStorage.getItem(SESSION_ACTIVE_KEY);
  if (!isActive) return false;
  
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
    if (!localStorage.getItem(SESSION_ACTIVE_KEY)) return;

    if (!isSessionValid()) {
      logout();
      return;
    }

    intervalRef.current = setInterval(() => {
      if (!isSessionValid()) {
        logout();
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, [logout]);
}