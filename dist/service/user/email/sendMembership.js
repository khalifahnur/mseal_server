"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const handlebars_1 = __importDefault(require("handlebars"));
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
const htmlTemplate = fs_1.default.readFileSync(path_1.default.join(__dirname, "..", "template", "membership.html"), "utf8");
const htmlCompiled = handlebars_1.default.compile(htmlTemplate);
const sendMembership = async (data) => {
    try {
        const templateData = {
            firstName: data.firstName,
            membershipTier: data.membershipTier,
            purchaseDate: data.purchaseDate,
            transcationId: data.transcationId,
            billingPeriod: data.billingPeriod,
            paymentMethod: data.paymentMethod,
            amount: data.amount,
            nextBillingDate: data.nextBillingDate,
            recurringAmount: data.recurringAmount,
        };
        const htmlContent = htmlCompiled(templateData);
        const mailOptions = {
            from: `"M-seal Team" <${process.env.GMAIL_USER}>`,
            to: data.email,
            subject: `Welcome to ${data.membershipTier}`,
            html: htmlContent,
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
module.exports = sendMembership;
//# sourceMappingURL=sendMembership.js.map