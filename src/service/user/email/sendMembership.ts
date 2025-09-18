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
  path.join(__dirname, "..", "template", "membership.html"),
  "utf8"
);

const htmlCompiled = Handlebars.compile(htmlTemplate);

const sendMembership = async (data: {
  firstName: string;
  email: string;
  membershipTier: string;
  purchaseDate: string;
  transactionId: string;
  billingPeriod: string;
  paymentMethod: string;
  amount: string;
  nextBillingDate: string;
  recurringAmount: string;
}) => {
  try {
    const templateData = {
      firstName: data.firstName,
      membershipTier: data.membershipTier,
      purchaseDate: data.purchaseDate,
      transcationId: data.transactionId,
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
      subject: `Welcome to ${data.membershipTier} tier`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error: any) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send membership confirmation: ${error.message}`);
  }
};

module.exports = sendMembership;
