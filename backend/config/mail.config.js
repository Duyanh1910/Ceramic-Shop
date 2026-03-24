import nodemailer from "nodemailer";

const user = process.env.EMAIL_USERNAME;
const password = process.env.EMAIL_PASSWORD;
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  
  auth: {
    user: user,
    pass: password,
  },
});

export default transporter;
