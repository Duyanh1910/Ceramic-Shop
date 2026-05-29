import {Server} from "socket.io";
import ErrorHandler from "../utils/error_handler.js";
import jwt from "jsonwebtoken";
import {CustomerModel} from "../models/index.js";

let io = null;

const getCookieValue = (cookieHeader = "", cookieName) => {
    return cookieHeader
        .split(";")
        .map((item) => item.trim())
        .find((item) => item.startsWith(`${cookieName}=`))
        ?.split("=")
        .slice(1)
        .join("=");
};

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [
                process.env.FRONTEND_URL,
                "http://localhost:5173",
                "https://ceramic-shop-rho.vercel.app",
            ].filter(Boolean),
            methods: ["GET", "POST"],
            credentials: true,
        },
        transports: ["polling", "websocket"],
    });
    io.use(async (socket, next) => {
        try {
            const authToken = socket.handshake.auth?.token;
            const cookieToken = getCookieValue(
                socket.handshake.headers?.cookie || "",
                "accessToken",
            );
            const token =
                authToken && authToken !== "null" && authToken !== "undefined"
                    ? authToken
                    : cookieToken;

            if (!token) {
                return next(new ErrorHandler("Unauthorized", 403));
            }
            const user = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = user;
            if (user.role == "Customer") {
                const customer = await CustomerModel.findOne(
                    {
                        where: {
                            MaTaiKhoan: user.id
                        }
                    }
                );
                socket.customerID = customer?.MaKhachHang;
            }
            next();
        } catch (err) {
            return next(new ErrorHandler("Unauthorized", 403));
        }
    });
    io.on("connection", (socket) => {
        const role = socket.user?.role;
        if (role == "Admin" || role == "Staff") {
            socket.join("admin_room");
            console.log(`Admin socket joined admin_room: account=${socket.user?.id}, role=${role}`);
        }
        if (role == "Customer" && socket.customerID) {
            socket.join(`customer_room:${socket.customerID}`);
        }
        console.log("Khởi tạo Socket thành công!");
        socket.on("disconnect", (reason) => {
            console.log(`Mất kết nối Socket: ${reason}!`);
        })
    });
    return io;
};

export const getSocket = () => {
    return io;
}

export const emitToAdmin = (event, payload) => {
    if (!io) {
        console.warn(`Socket.IO has not been initialized. Skip event ${event}`);
        return;
    }

    io.to("admin_room").emit(event, payload);
}

export const emitToCustomer = (customerId, event, payload) => {
    io?.to(`customer_room:${customerId}`).emit(event, payload);
};
