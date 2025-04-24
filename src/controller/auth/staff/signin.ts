import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import getSecretKey from "../../../lib/getSecretKey";
import { verifyPassword } from "../../../lib/hashPassword";

const sendSigninEmail = require("../../../service/waiter/email/sendSignin");
const Staff = require("../../../model/staff");

const loginStaff = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const staff = await Staff.findOne({ email });

    if (!staff) {
      return res.status(401).json({ message: "Incorrect Email/Password" });
    }

    const isPasswordMatch = verifyPassword(staff.password, password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Incorrect Email/Password" });
    }

    const secretKey = await getSecretKey();
    const token = jwt.sign({ staffId: staff._id }, secretKey, {
      expiresIn: "24h",
    });

    // Send email
    await sendSigninEmail(email);

    return res.status(200).json({
      token,
      staff: {
        restaurantId: staff.restaurantId,
        firstname: staff.firstname,
        lastname: staff.lastname,
        phoneNumber: staff.phoneNumber,
        email: staff.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error occurred during login" });
    console.log("Error occurred during login:", error);
  }
};

module.exports = loginStaff;
