import { Request, Response } from 'express';

const Admin = require('../../../model/admin');

interface AuthenticatedRequest extends Request {
  adminId?: {
    id: string;
  };
}

const getAdminInfo = async (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.adminId?.id;
  try {
    if (!adminId) {
      return res.status(400).json({ error: "admin not authenticated" });
    }

    const adminInfo = await Admin.findById(adminId);
    if (!adminInfo) {
      return res.status(404).json({ error: "admin info not found" });
    }

    const responseData = {
      firstName: adminInfo.firstName,
      lastName: adminInfo.lastName,
      email: adminInfo.email,
      phoneNumber: adminInfo.phoneNumber,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching admin info:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = getAdminInfo;