"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const staffSignIn = require("../../controller/auth/staff/signin");
const staffPassword = require("../../controller/auth/staff/staffPassword");
const staffVerfication = require("../../controller/auth/staff/staffAuth");
router.post("/staff-app-signin", staffSignIn);
router.post("/staff-new-password", staffPassword);
router.post("/staff-authentication", staffVerfication);
module.exports = router;
//# sourceMappingURL=staffrouter.js.map