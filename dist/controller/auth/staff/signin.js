"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getSecretKey_1 = __importDefault(require("../../../lib/getSecretKey"));
const hashPassword_1 = require("../../../lib/hashPassword");
const sendSigninEmail = require("../../../service/staff/email/sendSignin");
const Staff = require("../../../model/staff");
const loginStaff = async (req, res) => {
    try {
        const { email, password } = req.body;
        const staff = await Staff.findOne({ email });
        if (!staff) {
            return res.status(401).json({ message: "Incorrect Email/Password" });
        }
        const isPasswordMatch = (0, hashPassword_1.verifyPassword)(staff.password, password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Incorrect Email/Password" });
        }
        const secretKey = await (0, getSecretKey_1.default)(staff._id);
        const token = jsonwebtoken_1.default.sign({ staffId: staff._id }, secretKey, {
            expiresIn: "24h",
        });
        // Send email
        await sendSigninEmail(email);
        return res.status(200).json({
            token,
            staff: {
                firstname: staff.firstname,
                lastname: staff.lastname,
                phoneNumber: staff.phoneNumber,
                email: staff.email,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error occurred during login" });
        console.log("Error occurred during login:", error);
    }
};
module.exports = loginStaff;
//# sourceMappingURL=signin.js.map