import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const DEFAULT_EXPIRE_DAYS = 1;
const REMEMBER_ME_DAYS = 30;
const CHECK_INTERVAL_MS = 60 * 1000;

const TOKEN_EXPIRY_KEY = "token_expiry";
const REMEMBER_ME_KEY = "remember_me";
const SESSION_ACTIVE_KEY = "session_active";

export function saveSession(username, role, rememberMe) {
  const days = rememberMe ? 30 : 1;
  const expiry = Date.now() + days * 24 * 60 * 60 * 1000;

  const prefix = role === "Admin" || role === "Staff" ? "admin_" : "customer_";

  localStorage.setItem(prefix + "username", username);
  localStorage.setItem(prefix + "role", role);
  localStorage.setItem(prefix + "token_expiry", String(expiry));
  localStorage.setItem(prefix + "session_active", "true");
}

export function clearSession(isAdmin = false) {
  const prefix = isAdmin ? "admin_" : "customer_";
  [
    prefix + "username",
    prefix + "role",
    prefix + "token_expiry",
    prefix + "session_active",
  ].forEach((k) => localStorage.removeItem(k));
}

export function isSessionValid(isAdmin = false) {
  const prefix = isAdmin ? "admin_" : "customer_";

  const isActive = localStorage.getItem(prefix + "session_active");
  if (!isActive) return false;

  const expiry = Number(localStorage.getItem(prefix + "token_expiry"));
  if (!expiry) return true;
  return Date.now() < expiry;
}

export function useAutoLogout(isAdmin = false) {
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  const prefix = isAdmin ? "admin_" : "customer_";

  const logout = useCallback(() => {
    clearSession(isAdmin);
    message.warning("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", 5);
    navigate("/login");
  }, [navigate, isAdmin]);

  useEffect(() => {
    if (!localStorage.getItem(prefix + "session_active")) return;

    if (!isSessionValid(isAdmin)) {
      logout();
      return;
    }

    intervalRef.current = setInterval(() => {
      if (!isSessionValid(isAdmin)) {
        logout();
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, [logout, isAdmin, prefix]);
}
