// utils/sendEmail.js
import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER, // ton email
      pass: process.env.MAIL_PASS  // ton mot de passe ou "app password"
    }
  });

  await transporter.sendMail({
    from: `"MediLink" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
  });
};
