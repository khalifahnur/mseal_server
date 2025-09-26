"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require('../../../model/user');
const forgotPsswdProducer = require('../../../lib/queue/auth/forgotPsswd/producer');
const forgotPsswd = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).send("User not found");
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = resetCode;
        user.verificationCodeExpiration = Date.now() + 600000;
        user.authProvider = 'email',
            await user.save();
        await forgotPsswdProducer("reset_code", { email, resetCode });
        res.status(200).json({ message: "Verification code sent" });
    }
    catch (error) {
        res.status(500).send("Error sending verification code");
    }
};
module.exports = forgotPsswd;
//# sourceMappingURL=forgotpassword.js.map