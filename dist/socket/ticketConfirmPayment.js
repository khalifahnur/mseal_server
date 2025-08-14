"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ticket = require("../model/ticket");
const setupTicketWebSocket = (io) => {
    io.on("connection", async (socket) => {
        console.log("New client connected:", socket.id);
        const reference = socket.handshake.query.transactionReference;
        if (!reference || typeof reference !== "string") {
            console.log("No transactionReference provided, disconnecting...");
            socket.disconnect(true);
            return;
        }
        const sendTicketPaymentStatus = async () => {
            try {
                const ticket = await Ticket.findOne({ paymentReference: reference });
                if (ticket) {
                    socket.emit("confirmTicketPaymentStatus", {
                        paymentStatus: ticket.paymentStatus,
                    });
                }
                else {
                    socket.emit("confirmTicketPaymentStatus", {
                        paymentStatus: "Not-Found",
                    });
                }
            }
            catch (error) {
                console.error("Error sending real-time updates:", error);
            }
        };
        await sendTicketPaymentStatus();
        const interval = setInterval(sendTicketPaymentStatus, 10000);
        socket.on("disconnect", () => {
            clearInterval(interval);
            console.log("Client disconnected:", socket.id);
        });
    });
};
exports.default = setupTicketWebSocket;
//# sourceMappingURL=ticketConfirmPayment.js.map