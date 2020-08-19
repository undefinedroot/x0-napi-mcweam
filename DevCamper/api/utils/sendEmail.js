const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const from = `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`;

  const message = { from, to, subject, text };

  const info = await transporter.sendMail(message);

  console.log('Message Sent', info.messageId);
};

module.exports = sendEmail;