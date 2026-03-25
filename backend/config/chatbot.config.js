import mysql from "mysql2/promise";
import fs from "fs";
export const CHATBOT_LINKS = {
  domainWeb: "http://localhost:5173/product",
  zaloLink: "https://zalo.me/0329835725",
  emailLink: "mailto:theceramicshop24@gmail.com",
  phoneLink: "tel:0329835725",
  fbLink: "https://www.facebook.com/tran.duy.anh.714185",
  mapLink: "https://maps.app.goo.gl/23r4X895EBR44h2XA",
};

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: true,
  },
});
