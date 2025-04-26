import { Response, Request } from "express";
const StaffModel = require("../../../model/staff");
const sendStaffValidationCode = require("../../../service/staff/email/sendValidation");
const Admin = require("../../../model/admin");

interface AuthenticatedRequest extends Request {
  adminId?: {
    id: string;
  };
}

const StaffSignUp = async (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.adminId?.id;
  try {
    if (!adminId) {
      return res.status(400).json({ error: "admin not authenticated" });
    }

    const userInfo = await Admin.findById(adminId);
    if (!userInfo) {
      return res.status(404).json({ error: "admin info not found" });
    }
    const { firstname, lastname, email, phoneNumber } = req.body;

    if (!firstname || !lastname || !email || !phoneNumber) {
      console.log("Missing required field:", {
        firstname,
        lastname,
        email,
        phoneNumber,
      });
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await StaffModel.findOne({ email });

    if (existingUser) {
      return res.status(401).json({ message: "Staff already exists" });
    }
    const validationcode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const verificationCodeExpiration = Date.now() + 600000;

    const newStaff = new StaffModel({
      firstname,
      lastname,
      email,
      phoneNumber,
      validationcode,
      verificationCodeExpiration,
    });

    await newStaff.save();

    await sendStaffValidationCode(email, validationcode);

    res.status(200).json({ message: "Staff created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating Staff" });
    console.log("Error occurred during signup of Staff:", error);
  }
};

module.exports = StaffSignUp;
