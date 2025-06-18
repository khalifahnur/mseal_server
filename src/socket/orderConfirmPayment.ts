import { Server } from "socket.io";
const Order = require("../model/order");

const setupWebSocket = (io: Server) => {
  io.on("connection", async (socket) => {
    console.log("New client connected:", socket.id);

    const reference = socket.handshake.query.transactionReference;
    if (!reference || typeof reference !== "string") {
      console.log("No transactionReference provided, disconnecting...");
      socket.disconnect(true);
      return;
    }

    const sendOrderPaymentStatus = async () => {
      try {
        const order = await Order.findOne({ transactionReference: reference });

        if (order) {
          socket.emit("confirmOrderPaymentStatus", {
            orderId: order.orderId,
            paymentStatus: order.paymentStatus,
          });
        } else {
          socket.emit("confirmOrderPaymentStatus", {
            orderId: "",
            paymentStatus: "Failed",
          });
        }
      } catch (error) {
        console.error("Error sending real-time updates:", error);
      }
    };

    await sendOrderPaymentStatus();

    const interval = setInterval(sendOrderPaymentStatus, 10000);

    socket.on("disconnect", () => {
      clearInterval(interval);
      console.log("Client disconnected:", socket.id);
    });
  });
};


export default setupWebSocket;
