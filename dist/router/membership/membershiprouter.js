"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const NewMember = require("../../controller/membership/membership");
const validateMembership = require("../../controller/membership/verifyMembership");
const userMiddleware = require("../../middleware/userMiddleware");
router.post("/add-new-member", userMiddleware, NewMember);
router.post('/validate-membership-tier/:id', validateMembership);
module.exports = router;
//# sourceMappingURL=membershiprouter.js.map