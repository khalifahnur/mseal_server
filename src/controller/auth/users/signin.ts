import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { format } from "date-fns";
import { UAParser } from "ua-parser-js";
import axios from "axios";
import { verifyPassword } from "../../../lib/hashPassword";
import getSecretKey from "../../../lib/getSecretKey";

const publishToSignInQueue = require("../../../lib/queue/auth/signin/producer");

const User = require("../../../model/user");

const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Incorrect Email/Password" });
    }

    const isPasswordMatch = verifyPassword(user.password, password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Incorrect Email/Password" });
    }

    const secretKey = await getSecretKey(user._id.toString());

    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "24h",
    });

    const signinDateTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    // Device and Browser
    const userAgent = req.headers["user-agent"] || "";
    const parser = new UAParser();
    parser.setUA(userAgent);
    const deviceInfo = parser.getDevice();
    const device = `${deviceInfo.vendor || ""} ${
      deviceInfo.model || "Unknown Device"
    }`;
    const browserInfo = parser.getBrowser();
    const browser = `${browserInfo.name || "Unknown Browser"} ${
      browserInfo.version
    }`;

    const ipAddress = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    let location = "Unknown Location";
    try {
      const response = await axios.get(`http://ip-api.com/json/${ipAddress}`);
      const { city, country } = response.data;
      location = `${city}, ${country}`;
    } catch (error) {
      console.error("Location fetch error:", error);
    }

    try {
      await publishToSignInQueue("sign_in_detected", {
        firstName: user.firstName,
        signinDateTime,
        deviceInfo:device,
        browserInfo:browser,
        ipAddress,
        location,
        email,
      });
    } catch (queueError) {
      console.error("Failed to publish to sign-in queue:", queueError);
    }
    return res
      .cookie("user_auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        //sameSite: 'none',
        //domain: 'server-production-2ee7.up.railway.app',
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
        partitioned:true
      })
      .status(200)
      .json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Error occurred during login" });
    console.log("Error occurred during login:", error);
  }
};

module.exports = loginUser;
