import { Request, Response } from "express";

const Merchandise = require("../../model/merchandise");

const Admin = require("../../model/admin");

interface AuthenticatedRequest extends Request {
  adminId?: {
    id: string;
  };
}

const deleteMerchandise = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const adminId = req.adminId?.id;
  try {
    if (!adminId) {
      return res.status(400).json({ error: "Admin not authenticated" });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin info not found" });
    }
    const { id } = req.params;
    const deletedItem = await Merchandise.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ error: "Merchandise not found" });
    }
    res.status(200).json({ message: "Merchandise deleted successfully" });
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = deleteMerchandise;
