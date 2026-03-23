import mysql from "mysql2/promise";
export const CHATBOT_LINKS = {
  domainWeb: "http://127.0.0.1:5500/product.html",
  zaloLink: "https://zalo.me/0329835725",
  emailLink: "mailto:theceramicshop24@gmail.com",
  phoneLink: "tel:0329835725",
  mesLink: "https://m.me/tran.duy.anh.714185",
};

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
