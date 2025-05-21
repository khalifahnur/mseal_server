import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import Handlebars from "handlebars";

const encryptedTicket = require("../../../lib/encryptedQr");

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

const sendTicketConfirmation = async (
  ticketId: string,
  recipientEmail: string,
  metadata: any
) => {
  let eventId = metadata.eventId;
  const minimalTicketData = {
    ticketId,
    eventId,
  };

  const qrcode = encryptedTicket(minimalTicketData);
  try {
    const templateData = {
      eventId,
      date: metadata.date,
      venue: metadata.venue,
      match: metadata.match,
      qrcode,
    };

    const htmlContent = htmlCompiled(templateData);

    const mailOptions = {
      from: `"M-seal Team" <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      subject: `Your M-seal ticket #-${eventId}`,
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

module.exports = sendTicketConfirmation;
