import axios from "axios";
import { Request,Response } from "express";

const checkPaymentStatus = async (req: Request, res: Response) => {
    const { reference } = req.query;
  
    if (!reference) {
      return res.status(400).json({ error: "Reference is required" });
    }
  
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );
  
      const status = response.data.data.status; // "success", "pending", "failed"
      res.json({ status });
    } catch (error: any) {
      console.error("Error checking payment status:", error.message);
      res.status(500).json({ error: "Failed to check payment status" });
    }
  };
  
module.exports = checkPaymentStatus;