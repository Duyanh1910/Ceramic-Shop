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
import fs from "fs";
import http from "http";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import {fileURLToPath} from "url";

import {initSocket} from "./config/socketIO.js";
import router from "./routes/index.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerPath = path.join(__dirname, "docs", "swagger.yaml");
const vitePressDistPath = path.resolve(__dirname, "../docs/.vitepress/dist");

const MySQLStore = MySQLSession(session);
const sessionStore = new MySQLStore(dbConfig);

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

app.use(express.urlencoded({ extended: true }));
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

const swaggerDocument = YAML.parse(fs.readFileSync(swaggerPath, "utf8"));

app.get("/api-docs/openapi.yaml", (req, res) => {
  res.type("yaml").sendFile(swaggerPath);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customSiteTitle: "Pottery Shop API Docs",
  }),
);

if (fs.existsSync(vitePressDistPath)) {
  app.use("/docs", express.static(vitePressDistPath));
} else {
  app.use("/docs", (req, res) => {
    res.status(503).send(`
            <h1>Developer docs are not built yet</h1>
            <p>Run <code>cd docs && npm install && npm run build</code>, or set Render build command to build docs before starting backend.</p>
            <p>Swagger is still available at <a href="/api-docs">/api-docs</a>.</p>
        `);
  });
}

app.get("/", (req, res) => {
  res.send(`
        <h1>Pottery Shop Management System</h1>
        <ul>
            <li><a href="/api-docs">Swagger API Documentation</a></li>
            <li><a href="/docs">VitePress Developer Documentation</a></li>
        </ul>
    `);
});

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
