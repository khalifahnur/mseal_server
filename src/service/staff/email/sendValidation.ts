import fs from "fs";
import path from "path";
import nodemailer, { SentMessageInfo } from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendStaffValidationCode = (recipientEmail: string,verificationCode:string) => {
  // APPEND HTML FILE
  const htmlTemplate = fs.readFileSync(
    path.join(__dirname,"..","template", "validation.html"),
    "utf8"
  );

  const replaceVerificationCode = htmlTemplate.replace(
    "{{verification_code}}",
    verificationCode
  )

  const mailOptions = {
    from: '"MSEAL Team" <no-reply@mseal.com>',
    to: recipientEmail,
    subject: "M-seal Scan App Registration Code",
    html: replaceVerificationCode,
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

module.exports = sendStaffValidationCode;
