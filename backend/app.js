import { APP_PORT, cookie, dbConfig } from "./config/app_config.js";
import { connectDB } from "./config/database.js";
import errorMiddleware from "./middlewares/error.middlewares.js";
import express from "express";
import helmet from "helmet";
import session from "express-session";
import MySQLSession from "express-mysql-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./routes/auth.route.js";
const app = express();
const MySQLStore = MySQLSession(session);
const sessionStore = new MySQLStore(dbConfig);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    name: cookie.name,
    secret: cookie.secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(cookieParser());
app.use(cors());

app.use("/api/auth", authRoute);

app.use(errorMiddleware);
async function startServer() {
  await connectDB();

  app.listen(APP_PORT, () => {
    console.log(`🚀 Server chạy tại http://localhost:${APP_PORT}`);
  });
}

startServer();
