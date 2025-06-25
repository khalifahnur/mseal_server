import { Server } from "socket.io";
const Membership = require("../model/membership");

const setupMembershipWebSocket = (io: Server) => {
  io.on("connection", async (socket) => {
    console.log("New client connected:", socket.id);

    const reference = socket.handshake.query.transactionReference;
    if (!reference || typeof reference !== "string") {
      console.log("No transactionReference provided, disconnecting...");
      socket.disconnect(true);
      return;
    }

    const sendMembershipPaymentStatus = async () => {
      try {
        const member = await Membership.findOne({ reference: reference });

        if (member) {
          socket.emit("confirmMembershipPaymentStatus", {
            paymentStatus: member.paymentStatus,
          });
        } else {
          socket.emit("confirmMembershipPaymentStatus", {
            paymentStatus: "failed",
          });
        }
      } catch (error) {
        console.error("Error sending real-time updates:", error);
      }
    };

    await sendMembershipPaymentStatus();

    const interval = setInterval(sendMembershipPaymentStatus, 10000);

    socket.on("disconnect", () => {
      clearInterval(interval);
      console.log("Client disconnected:", socket.id);
    });
  });
};


export default setupMembershipWebSocket;
