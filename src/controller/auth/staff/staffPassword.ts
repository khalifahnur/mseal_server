import { Response, Request } from "express";
import { hashPassword } from "../../../lib/hashPassword";
const staffModel = require("../../../model/staff");

const staffPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const hashedPassword = await hashPassword(password);

    const updatedstaff = await staffModel.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
        validationcode: "",
        validationcodeExpiration: "",
      },
      { new: true }
    );

    if (!updatedstaff) {
      return res.status(404).json({ message: "staff not found" });
    }

    return res
      .status(200)
      .json({ message: "staff password created successfully" });
  } catch (error) {
    console.error("Error creating staff password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = staffPassword;
