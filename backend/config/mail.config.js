import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "a5e216001@smtp-brevo.com",
    pass: "d2SUXC6qMTNFQfZm",
  },
});


export default transporter;
