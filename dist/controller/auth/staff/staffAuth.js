"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const staffModel = require("../../../model/staff");
const staffAuthentication = async (req, res) => {
    try {
        const { email, validationcode } = req.body;
        if (!email || !validationcode) {
            return res
                .status(400)
                .json({ message: "Email and Verification Code are required!" });
        }
        const staffData = await staffModel.findOne({ email });
        if (!staffData) {
            return res.status(404).json({ message: "staff not found" });
        }
        const verify = staffData.validationcode === validationcode;
        if (!verify) {
            return res
                .status(401)
                .json({ message: "Verification code is incorrect or expired!" });
        }
        return res
            .status(200)
            .json({ message: "Successfully signed up", staffData });
    }
    catch (error) {
        console.error("Error in staffAuthentication:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
module.exports = staffAuthentication;
//# sourceMappingURL=staffAuth.js.map