import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import Handlebars from "handlebars";

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const htmlTemplate = fs.readFileSync(
  path.join(__dirname, "..", "template", "signup.html"),
  "utf8"
);

const htmlCompiled = Handlebars.compile(htmlTemplate);

const sendSIgnUp = async (data: {
    firstName:string;
    email:string;
    registrationDate:Date;
}) => {
  try {
    const templateData = {
      firstName: data.firstName,
      email: data.email,
      registrationDate:data.registrationDate
    };

    const htmlContent = htmlCompiled(templateData);

    const mailOptions = {
      from: `"M-seal Team" <${process.env.GMAIL_USER}>`,
      to: data.email,
      subject: "Welcome to MSeal",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error: any) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send ticket confirmation: ${error.message}`);
  }
};

module.exports = sendSIgnUp;
