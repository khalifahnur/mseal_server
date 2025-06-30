import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import getSecretKey from "../../../lib/getSecretKey";

const User = require("../../../model/user");

interface GoogleProfile {
  id: string;
  displayName: string;
  name: { givenName: string; familyName: string };
  emails: [{ value: string }];
}

const googleSignin = async (req: Request, res: Response) => {
  try {
    const userData = req.user as GoogleProfile;

    let user = await User.findOne({ email: userData.emails[0].value });

    if (!user) {
      user = new User({
        firstName: userData.name.givenName,
        lastName: userData.name.familyName,
        email: userData.emails[0].value,
        password: null,
        phoneNumber: null,
      });
      await user.save();
    }

    const secretKey = await getSecretKey(user._id.toString());
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "24h",
    });

    res
      .cookie("user_auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .redirect("https://mseal-membership.vercel.app/home");
  } catch (err) {
    console.error("Google auth error:", err);
    res.redirect("http://localhost:3000/login?error=auth_failed");
  }
};

module.exports = googleSignin;