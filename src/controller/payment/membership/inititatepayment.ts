import axios from 'axios';
import { Response, Request } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';


interface AuthenticatedRequest extends Request {
    user?: {
      id: string;
    };
  }

const initiatePayment = async (req: AuthenticatedRequest, res: Response) => {

    const { phoneNumber, amount, email, membershipTier, dob, physicalAddress, city } = req.body;
    const userId = req.user?.id;
  
    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: "Paystack secret key is missing" });
    }
  
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
  
    try {
      const response = await axios.post(
        "https://api.paystack.co/charge",
        {
          email,
          amount: amount * 100,
          currency: "KES",
          mobile_money: {
            phone: phoneNumber,
            provider: "mpesa",
          },
          metadata: {
            userId,
            membershipTier,
            dob,
            physicalAddress,
            city,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      res.json({
        message: "STK push initiated",
        status: true,
        reference: response.data.data.reference,
      });
    } catch (error: any) {
      console.error("Error initiating payment:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to initiate payment", details: error.response?.data || error.message });
    }
  };
  
module.exports = initiatePayment;