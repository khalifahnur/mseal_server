import { Request, Response } from "express";
import { hashPassword } from "../../../lib/hashPassword";
import { format } from "date-fns";

const User = require("../../../model/user");
const publishToSignUpQueue = require("../../../lib/queue/auth/signup/producer");

const signUpUser = async (req: Request, res: Response) => {
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

    const hashedPassword = await hashPassword(password);

    const newPhoneNumber = `+254${phoneNumber}`;

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber:newPhoneNumber,
    });

    await newUser.save();
    try {
      const registrationDate = format(newUser.createdAt, "MMMM d, yyyy");
      await publishToSignUpQueue("email_signup", {
        firstName,
        registrationDate,
        email,
      });
    } catch (queueError) {
      console.error("Failed to publish to sign-in queue:", queueError);
    }
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
    console.log("Error occurred during signup:", error);
  }
};

module.exports = signUpUser;
