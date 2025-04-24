import { Request, Response } from "express";

const Staff = require("../../../model/staff");

const Admin = require("../../../model/admin");

interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
  };
}

const deleteStaffAccount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const adminId = req.admin?.id;
  try {
    if (!adminId) {
      return res.status(400).json({ error: "Admin not authenticated" });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin info not found" });
    }
    const { id } = req.params;
    const deletedItem = await Staff.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ error: "Staff not found" });
    }
    res.status(200).json({ message: "Staff account deleted successfully" });
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = deleteStaffAccount;
