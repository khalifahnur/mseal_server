"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hashPassword_1 = require("../../../lib/hashPassword");
const User = require("../../../model/user");
const signUpUser = async (req, res) => {
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
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(401).json({ message: "User already exists" });
        }
        const hashedPassword = await (0, hashPassword_1.hashPassword)(password);
        const newPhoneNumber = `+254${phoneNumber}`;
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber: newPhoneNumber,
        });
        await newUser.save();
        res.status(200).json({ message: "User created successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating user" });
        console.log("Error occurred during signup:", error);
    }
};
module.exports = signUpUser;
//# sourceMappingURL=signup.js.map