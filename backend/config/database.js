import { Sequelize } from "sequelize";
import { dbConfig } from "./app_config.js";
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: "mysql",
    logging: false,
    pool: {
      min: dbConfig.pool.min,
      max: dbConfig.pool.max,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
    },
  }
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
