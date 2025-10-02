"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const handlebars_1 = __importDefault(require("handlebars"));
const qrcode_1 = __importDefault(require("qrcode"));
const encryptedTicket = require("../../../lib/encryptedQr");
require("dotenv").config();
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});
const htmlTemplate = fs_1.default.readFileSync(path_1.default.join(__dirname, "..", "template", "ticket.html"), "utf8");
const htmlCompiled = handlebars_1.default.compile(htmlTemplate);
const sendTicketConfirmation = async (ticketId, recipientEmail, metadata) => {
    let eventId = metadata.eventId;
    const minimalTicketData = [{
            id: ticketId,
            eventId,
        }];
    const encryptedData = encryptedTicket(minimalTicketData);
    const qrCodeDataURL = await qrcode_1.default.toDataURL(encryptedData, {
        width: 400,
        margin: 2,
        color: {
            dark: "#e16f23",
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
                    cid: 'ticketqr@mseal'
                }]
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
        return info;
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error(`Failed to send ticket confirmation: ${error.message}`);
    }
};
module.exports = sendTicketConfirmation;
//# sourceMappingURL=sendTicket.js.map