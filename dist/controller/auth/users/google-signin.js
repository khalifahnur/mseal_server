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
        if (!userData.emails?.[0]?.value) {
            throw new Error("Email is required");
        }
        let user = await User.findOne({ email: userData.emails[0].value });
        if (!user) {
            user = new User({
                firstName: userData.name?.givenName || "Unknown",
                lastName: userData.name?.familyName || "Unknown",
                email: userData.emails[0].value,
                password: null,
                phoneNumber: null,
                authProvider: 'google',
            });
            await user.save();
        }
        else if (user.authProvider !== 'google') {
            user.authProvider = 'google';
            user.firstName = userData.name?.givenName || user.firstName || "Unknown";
            user.lastName = userData.name?.familyName || user.lastName || "Unknown";
            user.password = null;
            await user.save();
        }
        const secretKey = await (0, getSecretKey_1.default)(user._id.toString());
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, secretKey, {
            expiresIn: "24h",
        });
        res
            .cookie("user_auth", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000,
        })
            .redirect("https://mseal-membership.vercel.app/home");
    }
    catch (err) {
        console.error("Google auth error:", err);
        res.redirect("https://mseal-membership.vercel.app/not-found");
    }
};
module.exports = googleSignin;
//# sourceMappingURL=google-signin.js.map