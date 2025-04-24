import { Request, Response } from "express";

const Merchandise = require("../../model/merchandise");

const getAllMerchandise = async (req: Request, res: Response) => {
  try {
    const items = await Merchandise.find().lean();

    res.status(200).json({
      message: "Merhcandise retrieved successfully",
      count: items.length,
      items,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching events", error: error.message });
  }
};

module.exports = getAllMerchandise;
