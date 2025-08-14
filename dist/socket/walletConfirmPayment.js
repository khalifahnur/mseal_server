"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Wallet = require("../model/wallet");
const setupWalletWebSocket = (io) => {
    io.on("connection", async (socket) => {
        console.log("New client connected:", socket.id);
        const reference = socket.handshake.query.transactionReference;
        if (!reference || typeof reference !== "string") {
            console.log("No transactionReference provided, disconnecting...");
            socket.disconnect(true);
            return;
        }
        const sendWalletPaymentStatus = async () => {
            try {
                const wallet = await Wallet.findOne({ prepaidReference: reference });
                if (wallet) {
                    socket.emit("confirmWalletPaymentStatus", {
                        paymentStatus: wallet.paymentStatus,
                    });
                }
                else {
                    socket.emit("confirmWalletPaymentStatus", {
                        paymentStatus: "Not-Found",
                    });
                }
            }
            catch (error) {
                console.error("Error sending real-time updates:", error);
            }
        };
        await sendWalletPaymentStatus();
        const interval = setInterval(sendWalletPaymentStatus, 10000);
        socket.on("disconnect", () => {
            clearInterval(interval);
            console.log("Client disconnected:", socket.id);
        });
    });
};
exports.default = setupWalletWebSocket;
//# sourceMappingURL=walletConfirmPayment.js.map