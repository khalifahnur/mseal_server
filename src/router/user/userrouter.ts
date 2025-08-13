import express from "express";
import passport from "passport";

const router = express.Router();

const UserSignup = require("../../controller/auth/users/signup");
const UserSignin = require("../../controller/auth/users/signin");
const userInfo = require("../../controller/auth/users/fetchuserinfo");
const phoneNumber = require("../../controller/auth/users/updatephoneNumber");
const userMiddleware = require("../../middleware/userMiddleware");
const logoutUser = require("../../controller/auth/users/logout");
const resetCode = require("../../controller/auth/users/forgotpassword");
const verifyCode = require("../../controller/auth/users/verifycode");
const newPsswd = require("../../controller/auth/users/newpassword")

const googleSignin = require("../../controller/auth/users/google-signin");

//const forgotPsswdController = require("../../controllers/auth/users/forgotpassword");
//const verifyCodeController = require("../../controllers/auth/users/verifycode");
//const resetPasswordController = require("../../controllers/auth/users/newpassword");

router.post("/signUp", UserSignup);
router.post("/signIn", UserSignin);
router.get("/fetch-user-info", userMiddleware, userInfo);
router.post("/logout", userMiddleware, logoutUser);
router.patch("/update-user-phone-number",userMiddleware,phoneNumber)
//router.post("/forgot-password", forgotPsswdController);
//router.post("/verify-code", verifyCodeController);
//router.post("/reset-password", resetPasswordController);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  googleSignin
);

router.post("/forgot-password/verify-email",resetCode),
router.post("/forgot-password/verify-code", verifyCode),
router.post("/forgot-password/new-passowrd", newPsswd),

module.exports = router;
