"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getSecretKey_1 = __importDefault(require("../../../lib/getSecretKey"));
const User = require("../../../model/user");
const googleSignin = async (req, res) => {
    try {
        const userData = req.user;
        let user = await User.findOne({ email: userData.emails[0].value });
        if (!user) {
            user = new User({
                firstName: userData.name.givenName,
                lastName: userData.name.familyName,
                email: userData.emails[0].value,
                password: null,
                phoneNumber: null,
            });
            await user.save();
        }
        const secretKey = await (0, getSecretKey_1.default)();
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, secretKey, {
            expiresIn: "24h",
        });
        res
            .cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000,
        })
            .redirect("http://localhost:3000/home");
    }
    catch (err) {
        console.error("Google auth error:", err);
        res.redirect("http://localhost:3000/login?error=auth_failed");
    }
};
module.exports = googleSignin;
//# sourceMappingURL=google-signin.js.map