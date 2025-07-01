import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import QRCode from "qrcode";

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
    id:ticketId,
    eventId,
  };

  const encryptedData = encryptedTicket(minimalTicketData);

  const qrCodeDataURL = await QRCode.toDataURL(encryptedData, {
      width: 400,
      margin: 2,
      color: {
        dark: "#fae115",
        light: "#000000"
      }
    });

  try {
    const templateData = {
      ticketId,
      date: new Date(metadata.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      venue: metadata.venue,
      match: metadata.match,
      qrcode: qrCodeDataURL,
      year: new Date().getFullYear()
    };

    const htmlContent = htmlCompiled(templateData);

    const mailOptions = {
      from: `"M-seal Team" <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      subject: `M-seal ticket for ${metadata.match}`,
      html: htmlContent,
      attachments: [{
        filename: 'ticket-qr.png',
        content: qrCodeDataURL.split('base64,')[1],
        encoding: 'base64',
        cid: 'ticketqr@mseal' // Content ID for embedding
      }]
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
