"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
const UserSignup = require("../../controller/auth/users/signup");
const UserSignin = require("../../controller/auth/users/signin");
const userInfo = require("../../controller/auth/users/fetchuserinfo");
const phoneNumber = require("../../controller/auth/users/updatephoneNumber");
const userMiddleware = require("../../middleware/userMiddleware");
const logoutUser = require("../../controller/auth/users/logout");
const resetCode = require("../../controller/auth/users/forgotpassword");
const verifyCode = require("../../controller/auth/users/verifycode");
const newPsswd = require("../../controller/auth/users/newpassword");
const nfcStatus = require("../../controller/wallet/nfcStatus");
const googleSignin = require("../../controller/auth/users/google-signin");
const oauthSignin = require("../../controller/auth/others/oauthSignin");
const fetchotherinfo = require("../../controller/auth/others/fetchotherinfo");
router.post("/signUp", UserSignup);
router.post("/signIn", UserSignin);
router.get("/fetch-user-info", userMiddleware, userInfo);
router.get("/fetch-other-info", userMiddleware, fetchotherinfo);
router.post("/logout", userMiddleware, logoutUser);
router.patch("/update-user-phone-number", userMiddleware, phoneNumber);
router.post("/forgot-password/verify-email", resetCode),
    router.post("/forgot-password/verify-code", verifyCode),
    router.post("/forgot-password/new-passowrd", newPsswd),
    router.patch("/wallet/nfc", userMiddleware, nfcStatus);
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/" }), googleSignin);
module.exports = router;
//# sourceMappingURL=userrouter.js.map