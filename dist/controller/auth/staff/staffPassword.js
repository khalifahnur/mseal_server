"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hashPassword_1 = require("../../../lib/hashPassword");
const staffModel = require("../../../model/staff");
const staffPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }
        const hashedPassword = await (0, hashPassword_1.hashPassword)(password);
        const updatedstaff = await staffModel.findOneAndUpdate({ email }, {
            password: hashedPassword,
            validationcode: "",
            validationcodeExpiration: "",
        }, { new: true });
        if (!updatedstaff) {
            return res.status(404).json({ message: "staff not found" });
        }
        return res
            .status(200)
            .json({ message: "staff password created successfully" });
    }
    catch (error) {
        console.error("Error creating staff password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
module.exports = staffPassword;
//# sourceMappingURL=staffPassword.js.map