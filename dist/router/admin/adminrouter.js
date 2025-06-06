"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const AdminSignup = require("../../controller/auth/admin/signup");
const AdminSignin = require("../../controller/auth/admin/signin");
const FetchAdminInfo = require("../../controller/auth/admin/fetchAdminInfo");
const LogoutAdmin = require("../../controller/auth/admin/logout");
const StaffSignUp = require("../../controller/auth/admin/staffSignup");
const FetchAllStaff = require("../../controller/auth/admin/fetchStaff");
const RemoveStaffAccount = require("../../controller/auth/admin/removeStaff");
const authenticateAdmin = require("../../middleware/adminMiddleware");
// const AuthController = require("../controllers/AuthController");
// const forgotPsswdController = require("../controllers/ForgotPsswdController");
// const verifyCodeController = require("../controllers/VerifyCodeController");
// const resetPasswordController = require("../controllers/NewPassword")
router.post("/signup-admin", AdminSignup);
router.post("/signin-admin", AdminSignin);
router.get("/fetch-admin-info", authenticateAdmin, FetchAdminInfo);
// router.post("/:userId/updateRestaurantDetails", AuthController.updateRestaurantDetails);
// router.post("/forgot-password",forgotPsswdController.forgotPsswd);
// router.post("/verify-code",verifyCodeController.verifyCode);
// router.post("/reset-password",resetPasswordController.resetPassword);
router.post("/logout-admin", authenticateAdmin, LogoutAdmin);
router.post("/Staff/app-signup", authenticateAdmin, StaffSignUp);
router.get("/fetch-all-staff-details", authenticateAdmin, FetchAllStaff);
router.post("/remove-staff-account", authenticateAdmin, RemoveStaffAccount);
module.exports = router;
//# sourceMappingURL=adminrouter.js.map