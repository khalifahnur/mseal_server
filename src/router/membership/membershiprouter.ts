import express from "express";

const router = express.Router();

const NewMember = require("../../controller/membership/membership");
const validateMembership = require("../../controller/membership/verifyMembership");

const userMiddleware = require("../../middleware/userMiddleware");

router.post("/add-new-member", userMiddleware, NewMember);
router.post('/validate-membership-tier/:id', validateMembership);

module.exports = router;
