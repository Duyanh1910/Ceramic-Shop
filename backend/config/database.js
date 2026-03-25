import { Sequelize } from "sequelize";
import { dbConfig } from "./app_config.js";
import fs from "fs";
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        require: true,
        ca: fs.readFileSync(new URL("../isrgrootx1.pem", import.meta.url)),
      },
    },
    logging: false,
    pool: {
      min: dbConfig.pool.min,
      max: dbConfig.pool.max,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
    },
  },
);
export const connectDB = async () => {
  sequelize
    .authenticate()
    .then(() => {
      console.log("Kết nối database thành công!");
    })
    .catch((err) => {
      console.log("Kết nối database không thành công: ", err.message);
      process.exit(1);
    });
};

export default sequelize;
