import nodemailer from "nodemailer";

const user = process.env.EMAIL_USERNAME;
const password = process.env.EMAIL_PASSWORD;
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: user,
    pass: password,
  },
});

export default transporter;
