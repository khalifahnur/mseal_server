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
  path.join(__dirname, "..", "template", "ticket.html"),
  "utf8"
);

const htmlCompiled = Handlebars.compile(htmlTemplate);

const sendTicketValidConfirmation = async (
  ticketId: string,
  recipientEmail: string,
  fullName?: string,
  eventName?: string,
  scanTime?: any,
  date?: any,
  venue?: string,
  seat?: string,
  quantity?: any
) => {
  try {
    const templateData = {
      ticketId,
      fullName,
      eventName,
      scanTime,
      date,
      venue,
      seat,
      quantity,
      currentYear: new Date().getFullYear(),
    };

    const htmlContent = htmlCompiled(templateData);

    const mailOptions = {
      from: `"M-seal Team" <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      subject: `✅ Your Murang'a Seal Ticket Has Been Validated ${eventName}`,
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

module.exports = sendTicketValidConfirmation;
