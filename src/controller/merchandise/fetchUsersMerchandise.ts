import { Request, Response } from "express";

const Merchandise = require("../../model/merchandise");

const getUsersMerchandise = async (req: Request, res: Response) => {
  try {
    const items = await Merchandise.find().lean();

    const responseItems = items.map((item: any) => ({
      id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imgUrl: item.imageUrl,
      stock:item.stock
    }));

    res.status(200).json({
      message: "Merchandise retrieved successfully",
      responseItems,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching merchandise", error: error.message });
  }
};

module.exports = getUsersMerchandise;
