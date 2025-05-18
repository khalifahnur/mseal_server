"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hashPassword_1 = require("../../../lib/hashPassword");
const Admin = require("../../../model/admin");
const signUpAdmin = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phoneNumber } = req.body;
        if (!firstName || !lastName || !email || !password || !phoneNumber) {
            console.log("Missing required field:", {
                firstName,
                lastName,
                email,
                password,
                phoneNumber,
            });
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(401).json({ message: "Admin already exists" });
        }
        const hashedPassword = await (0, hashPassword_1.hashPassword)(password);
        const newAdmin = new Admin({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber
        });
        await newAdmin.save();
        res.status(200).json({ message: "Admin created successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating user" });
        console.log("Error occurred during signup:", error);
    }
};
module.exports = signUpAdmin;
//# sourceMappingURL=signup.js.map