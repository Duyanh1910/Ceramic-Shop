const DEFAULT_API_ORIGIN = "https://ceramic-shop-u8ak.onrender.com";

const configuredApiUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  DEFAULT_API_ORIGIN
).replace(/\/$/, "");

export const API_BASE = configuredApiUrl.endsWith("/api/v1")
  ? configuredApiUrl
  : `${configuredApiUrl}/api/v1`;
export const API_ORIGIN = API_BASE.replace(/\/api\/v1$/, "");
export const API_ADMIN_BASE = `${API_BASE}/admin`;

export default API_BASE;
