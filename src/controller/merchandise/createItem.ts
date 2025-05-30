import { Request, Response } from "express";

const Merchandise = require("../../model/merchandise");

const Admin = require("../../model/admin");

interface AuthenticatedRequest extends Request {
  adminId?: {
    id: string;
  };
}

const createMerchandise = async (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.adminId?.id;
  
  try {
    if (!adminId) {
      return res.status(400).json({ error: "Admin not authenticated" });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin info not found" });
    }

    const { name, description, price, stock, category, imageUrl } = req.body;
    
    if (!name || !price || !stock || !category || !imageUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create new merchandise with an object containing all fields
    const item = new Merchandise({
      adminId,
      name,
      description,
      price,
      stock,
      category,
      imageUrl
    });

    await item.save();
    res.status(201).json(item);
  } catch (error: any) {
    console.error("Error creating merchandise:", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = createMerchandise;
