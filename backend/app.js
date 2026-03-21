import { APP_PORT, cookie, dbConfig } from "./config/app_config.js";
import { connectDB } from "./config/database.js";
import { connectRedis } from "./config/redis.config.js";
import transporter from "./config/mail.config.js";
import errorMiddleware from "./middlewares/error.middlewares.js";
import express from "express";
import fs from "fs";
import yaml from "yaml";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";
import session from "express-session";
import MySQLSession from "express-mysql-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./routes/index.js";
const app = express();
const MySQLStore = MySQLSession(session);
const sessionStore = new MySQLStore(dbConfig);

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
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
  }),
);
app.use(cookieParser());
app.use(cors());

app.use("/api/v1", router);

app.use(errorMiddleware);
async function startServer() {
  try {
    await connectDB();
    await transporter.verify();
    await connectRedis();
    app.listen(APP_PORT, () => {
      console.log(`🚀 Server chạy tại http://localhost:${APP_PORT}`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

startServer();
