import { Request, Response } from "express";

const Member = require("../../model/membership");

const validateMembership = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership ID format",
      });
    }

    const member = await Member.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    if (member.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: `Membership is ${member.status.toLowerCase()}, not active`,
      });
    }

    const currentDate = new Date();
    if (member.expDate && member.expDate < currentDate) {
      return res.status(400).json({
        success: false,
        message: "Membership has expired",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Member is a ${member.membershipTier} tier`,
      data: {
        membershipTier: member.membershipTier,
        memberNo: member.memberNo,
        expDate: member.expDate,
        status: member.status,
      },
    });
  } catch (error) {
    console.error("Error validating membership tier:", error);
    return res.status(500).json({
      success: false,
      message: "Server error validating membership tier",
    });
  }
};

module.exports = validateMembership;