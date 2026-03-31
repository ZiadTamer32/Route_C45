import nodemailer from "nodemailer";
import {
  EMAIL_PASSWORD,
  EMAIL_SERVICE,
  EMAIL_USERNAME,
} from "../../../config/app.config.js";

const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Saraha App" <${EMAIL_USERNAME}>`,
      to,
      subject,
      html,
    });
    console.log("Message sent", info.messageId);
  } catch (err) {
    throw new Error(`Error sending verification email: ${err}`);
  }
};

export default sendEmail;
