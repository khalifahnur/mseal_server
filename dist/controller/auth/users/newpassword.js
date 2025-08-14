"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hashPassword_1 = require("../../../lib/hashPassword");
const User = require('../../../model/user');
const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).send('User not found');
        const hashedPassword = await (0, hashPassword_1.hashPassword)(newPassword);
        user.password = hashedPassword;
        user.verificationCode = null;
        user.verificationCodeExpiration = null;
        await user.save();
        res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).send('Error updating password');
    }
};
module.exports = resetPassword;
//# sourceMappingURL=newpassword.js.map