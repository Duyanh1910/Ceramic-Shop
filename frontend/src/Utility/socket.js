import {io} from "socket.io-client";

const SOCKET_URL = "https://ceramic-shop-u8ak.onrender.com";

export const adminSocket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    autoConnect: false,
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
});

export const connectAdminSocket = () => {
    const token = localStorage.getItem("admin_token") || localStorage.getItem("token");

    if (!token) return null;

    adminSocket.auth = {token};

    if (!adminSocket.connected) {
        adminSocket.connect();
    }

    return adminSocket;
};

export const disconnectAdminSocket = () => {
    if (adminSocket.connected) {
        adminSocket.disconnect();
    }
};
