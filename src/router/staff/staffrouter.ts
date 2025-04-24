import express from "express";

const router = express.Router();

const staffSignIn = require("../../controller/auth/staff/signin");
const staffPassword = require("../../controller/auth/staff/staffPassword");
const staffVerfication = require("../../controller/auth/staff/staffAuth");

router.post("/staff-app-signin", staffSignIn);
router.post("/staff-new-password", staffPassword);
router.post("/staff-authentication", staffVerfication);

module.exports = router;
