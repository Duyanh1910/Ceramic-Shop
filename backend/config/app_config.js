import "dotenv/config";
const APP_PORT = process.env.APP_PORT;
const SALT_ROUNDS = process.env.SALT_ROUNDS;
const DB_PORT = process.env.DB_PORT;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;

const dbConfig = {
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  pool: {
    min: 0,
    max: 5,
    acquire: 30000,
    idle: 10000,
  },
};

const cookie = {
  name: process.env.COOKIE_NAME,
  secret: process.env.COOKIE_SECRET,
};

export { APP_PORT, SALT_ROUNDS, dbConfig, cookie };
