"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const AdminSignup = require("../../controller/auth/admin/signup");
const VerifyCode = require("../../controller/auth/admin/signin");
const FetchAdminInfo = require("../../controller/auth/admin/fetchAdminInfo");
const LogoutAdmin = require("../../controller/auth/admin/logout");
const StaffSignUp = require("../../controller/auth/admin/staffSignup");
const FetchAllStaff = require("../../controller/auth/admin/fetchStaff");
const RemoveStaffAccount = require("../../controller/auth/admin/removeStaff");
const FetchMembershipInfo = require("../../controller/auth/admin/fetchMemberInfo");
const VerifyEmail = require("../../controller/auth/admin/verifyEmail");
const updatePhysicalNfcGiven = require("../../controller/wallet/physicalCardGiven");
const authenticateAdmin = require("../../middleware/adminMiddleware");
router.post("/signup-admin", AdminSignup);
//router.post("/signin-admin", AdminSignin);
router.get("/fetch-admin-info", authenticateAdmin, FetchAdminInfo);
router.post("/signup-admin/verify-email", VerifyEmail),
    router.post("/signup-admin/verify-code", VerifyCode),
    router.post("/logout-admin", authenticateAdmin, LogoutAdmin);
router.post("/Staff/app-signup", authenticateAdmin, StaffSignUp);
router.get("/fetch-all-staff-details", authenticateAdmin, FetchAllStaff);
router.post("/remove-staff-account", authenticateAdmin, RemoveStaffAccount);
router.get("/fetch-membership-info", authenticateAdmin, FetchMembershipInfo);
router.put("/update-physical-nfc-given/:walletId", authenticateAdmin, updatePhysicalNfcGiven);
module.exports = router;
//# sourceMappingURL=adminrouter.js.map