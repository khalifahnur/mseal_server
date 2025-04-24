import express from "express";

const router = express.Router();

const NewMember = require("../../controller/membership/membership");

const userMiddleware = require("../../middleware/userMiddleware");

router.post("/add-new-member", userMiddleware, NewMember);

module.exports = router;
