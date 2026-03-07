import { APP_PORT, cookie, dbConfig } from "./config/app_config.js";
import { connectDB } from "./config/database.js";
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

const file = fs.readFileSync("./docs/swagger.yaml", "utf8");
const swaggerDocument = yaml.parse(file);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cookieParser());
app.use(cors());

app.use("/api/v1", router);

app.use(errorMiddleware);
async function startServer() {
  await connectDB();

  app.listen(APP_PORT, () => {
    console.log(`🚀 Server chạy tại http://localhost:${APP_PORT}`);
    console.log(`📚 Tài liệu API tại: http://localhost:${APP_PORT}/api-docs`);
  });
}

startServer();
