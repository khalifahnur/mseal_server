import fs from "fs";
import path from "path";
import nodemailer, { SentMessageInfo } from "nodemailer";

require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendStaffSigninEmail = (recipientEmail: string) => {
  // APPEND HTML FILE
  const htmlTemplate = fs.readFileSync(
      path.join(__dirname,"..","template", "staffsignin.html"),
      "utf8"
    );

  const personalizedHtmlTemplate = htmlTemplate.replace(
    "{{email}}",
    recipientEmail
  );

  const mailOptions = {
    from: `"M-seal Team" <${process.env.GMAIL_USER}>`,
    to: recipientEmail,
    subject: "Mseal staff Sign-In Verification",
    html: personalizedHtmlTemplate,
  };

  // Send email
  transporter.sendMail(
    mailOptions,
    (error: Error | null, info: SentMessageInfo) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent: %s", info.messageId);
      }
    }
  );
};

module.exports = sendStaffSigninEmail;
