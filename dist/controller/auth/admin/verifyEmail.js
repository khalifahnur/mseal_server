"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Admin = require('../../../model/admin');
const sendVerificationProducer = require('../../../lib/queue/auth/verifyAdmin/producer');
const VerifyAdminEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin)
            return res.status(404).send("User not found");
        // Generate verification code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        admin.verificationCode = resetCode;
        admin.verificationCodeExpiration = Date.now() + 600000;
        await admin.save();
        await sendVerificationProducer("verify_code", { email, resetCode });
        res.status(200).json({ message: "Verification code sent" });
    }
    catch (error) {
        res.status(500).send("Error sending verification code");
    }
};
module.exports = VerifyAdminEmail;
//# sourceMappingURL=verifyEmail.js.map