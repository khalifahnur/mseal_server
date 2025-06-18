import axios from "axios";
import { Request, Response } from "express";
import { validationResult } from "express-validator";

const User = require("../../../../model/user");
const Membership = require("../../../../model/membership");

const getPesapalToken = require("./pesapaltoken");

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const initiatePesapalPayment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { tier, isUpgrade, dob, physicalAddress, city } = req.body;
  const userId = req.user?.id;
  const amount = tier === "bronze" ? 2000 : tier === "silver" ? 5000 : 10000;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let membership = user.membershipId
      ? await Membership.findById(user.membershipId)
      : null;

    if (isUpgrade && !membership) {
      return res.status(400).json({ error: "No membership to upgrade" });
    }
    if (isUpgrade && ["gold"].includes(membership.membershipTier)) {
      return res.status(400).json({ error: "Already at highest tier" });
    }
    if (isUpgrade && membership.membershipTier === tier) {
      return res.status(400).json({ error: "Cannot upgrade to same tier" });
    }
    if (!isUpgrade && membership && membership.membershipTier !== "none") {
      return res
        .status(400)
        .json({ error: "User already has a membership. Use upgrade instead" });
    }

    const reference = `MSEAL-${userId}-${Date.now()}`;
    if (!membership) {
      if (!dob || !physicalAddress || !city) {
        return res.status(400).json({
          error: "DOB, address, and city required for new membership",
        });
      }
      membership = new Membership({
        membershipTier: "none",
        amount,
        dob,
        physicalAddress,
        city,
        reference,
        paymentStatus: "pending",
      });
    } else {
      membership.amount = amount;
      membership.paymentStatus = "pending";
      membership.reference = reference;
    }
    //await membership.save();

    const token = await getPesapalToken();
    const orderId = reference;
    const callbackUrl = 'http://rnrci-41-90-184-227.a.free.pinggy.link/home';
    const notificationUrl = 'https://bd48-41-90-184-227.ngrok-free.app/mseal/pyament/pesapal/initiate-membership-callback';
    console.log("token",token)
    const paymentRequest = await axios.post(
      "https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest",
      {
        id: orderId,
        currency: "KES",
        amount,
        description: isUpgrade
          ? `Upgrade to ${tier} membership`
          : `${tier} membership subscription`,
        callback_url: callbackUrl,
        notification_url: notificationUrl,
        billing_address: { email_address: user.email, country_code: "KE" },
        metadata: { userId, isUpgrade: isUpgrade.toString() },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    membership.pesapalTransactionId = paymentRequest.data.order_tracking_id;
    await membership.save();

    return res
      .status(200)
      .json({ redirectUrl: paymentRequest.data.redirect_url, reference });
  } catch (error) {
    console.warn("initiate pesapal", error)
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = initiatePesapalPayment;
