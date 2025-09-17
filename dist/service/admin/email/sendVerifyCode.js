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
const htmlTemplate = fs_1.default.readFileSync(path_1.default.join(__dirname, "..", "template", "verifyEmail.html"), "utf8");
const htmlCompiled = handlebars_1.default.compile(htmlTemplate);
const sendSIgnIn = async (data) => {
    try {
        const templateData = {
            ...data,
            year: new Date().getFullYear(),
        };
        const htmlContent = htmlCompiled(templateData);
        const mailOptions = {
            from: `"M-seal Team" <${process.env.GMAIL_USER}>`,
            to: data.email,
            subject: "Signin Verification",
            html: htmlContent,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
        return info;
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error(`Failed to send reset code: ${error.message}`);
    }
};
module.exports = sendSIgnIn;
//# sourceMappingURL=sendVerifyCode.js.map