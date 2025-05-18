"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const transferToMpesa = require("./transferpayment");
const Membership = require("../../../model/membership");
const User = require("../../../model/user");
const crypto = __importStar(require("crypto"));
const handleWebhook = async (req, res) => {
    try {
        const secret = process.env.PAYSTACK_SECRET_KEY || "";
        const hash = crypto
            .createHmac("sha512", secret)
            .update(JSON.stringify(req.body))
            .digest("hex");
        if (hash !== req.headers["x-paystack-signature"]) {
            console.error("Invalid Paystack signature");
            return res.sendStatus(400);
        }
        console.log("Webhook received:", JSON.stringify(req.body, null, 2));
        const event = req.body;
        if (!event || !event.event || event.event !== "charge.success") {
            console.log("Invalid or non-success event received");
            return res.sendStatus(200); // Acknowledge but skip processing
        }
        const reference = event.data.reference;
        // Check for duplicates
        const existingMembership = await Membership.findOne({ reference });
        if (existingMembership) {
            console.log("Duplicate webhook ignored:", reference);
            return res.sendStatus(200);
        }
        // Acknowledge
        res.sendStatus(200);
        processWebhookEvent(event).catch((error) => {
            console.error("Error processing webhook event:", error.message);
        });
    }
    catch (error) {
        console.error("Webhook error during initial handling:", error.message);
        res.sendStatus(200);
    }
};
const processWebhookEvent = async (event) => {
    const metadata = event.data.metadata;
    const userId = metadata?.userId;
    const amount = event.data.amount / 100;
    const reference = event.data.reference;
    if (!userId) {
        console.error("Missing userId in metadata:", metadata);
        return;
    }
    const user = await User.findById(userId);
    if (!user) {
        console.error("User not found for ID:", userId);
        return;
    }
    // Membership data
    const membershipData = {
        membershipTier: metadata.membershipTier,
        dob: metadata.dob || null,
        physicalAddress: metadata.physicalAddress,
        city: metadata.city,
        amount,
        reference,
    };
    const newMember = new Membership(membershipData);
    const savedData = await newMember.save();
    console.log("Membership saved:", savedData);
    await User.findByIdAndUpdate(userId, {
        membershipId: savedData._id,
    });
    console.log("User updated with membership ID:", savedData._id);
    // Transfer to reciever number
    await transferToMpesa(amount);
    console.log("Transfer to business Till completed successfully");
};
module.exports = handleWebhook;
//# sourceMappingURL=webhook.js.map