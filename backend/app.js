import {cookie, dbConfig} from "./config/app_config.js";
import {connectDB} from "./config/database.js";
import errorMiddleware from "./middlewares/error.middlewares.js";

import express from "express";
import helmet from "helmet";
import passport from "passport";
import session from "express-session";
import MySQLSession from "express-mysql-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";

import {initSocket} from "./config/socketIO.js";
import router from "./routes/index.js";

const app = express();

const MySQLStore = MySQLSession(session);
const sessionStore = new MySQLStore(dbConfig);

app.use(
    helmet({
        contentSecurityPolicy: false,
    }),
);

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(
    session({
        name: cookie.name,
        secret: cookie.secret,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        },
    }),
);

app.use(cookieParser());
app.use(passport.initialize());

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            process.env.FRONTEND_URL,
            "https://ceramic-shop-rho.vercel.app",
        ].filter(Boolean),
        credentials: true,
    }),
);

app.use("/api/v1", router);

app.use(errorMiddleware);

async function startServer() {
    await connectDB();

    const PORT = process.env.PORT || 3000;

    const server = http.createServer(app);

    initSocket(server);

    server.listen(PORT, () => {
        console.log(`🚀 Server chạy tại port ${PORT}`);
    });

}

startServer().catch((err) => {
    console.error("Không thể khởi động server:", err);
    process.exit(1);
});