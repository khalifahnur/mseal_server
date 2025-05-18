"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const hashPassword_1 = require("../../../lib/hashPassword");
const getSecretKey_1 = __importDefault(require("../../../lib/getSecretKey"));
//const sendSigninEmail = require('../../../services/email')
const User = require("../../../model/user");
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Incorrect Email/Password" });
        }
        //const isPasswordMatch = await bcrypt.compare(password, user.password);
        const isPasswordMatch = (0, hashPassword_1.verifyPassword)(user.password, password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Incorrect Email/Password" });
        }
        const secretKey = await (0, getSecretKey_1.default)();
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, secretKey, {
            expiresIn: "24h",
        });
        return res
            .cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only secure in production
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'lax' for local
            //sameSite: 'none',
            //domain: 'server-production-2ee7.up.railway.app',
            path: "/",
            maxAge: 24 * 60 * 60 * 1000,
        })
            .status(200)
            .json({ message: "Login successful" });
        // Send email
        //await sendSigninEmail(email);
        // return res.status(200).json({
        //   token,
        //   user: {
        //     userId: user._id,
        //     name: user.name,
        //     email: user.email,
        //     phoneNumber: user.phoneNumber,
        //   },
        // });
    }
    catch (error) {
        res.status(500).json({ message: "Error occurred during login" });
        console.log("Error occurred during login:", error);
    }
};
module.exports = loginUser;
//# sourceMappingURL=signin.js.map