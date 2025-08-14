"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = __importDefault(require("amqplib"));
const dotenv_1 = __importDefault(require("dotenv"));
const sendSIgnUp = require("../../../../service/user/email/sendSignUp");
dotenv_1.default.config();
const rabbitMQUrl = process.env.RABBITMQ_PRIVATE_URL || "amqp://guest:guest@localhost:5672";
// const rabbitMQUrl = "amqp://guest:guest@localhost:5672";
const queue = "email_signup";
const consumeEmailQueue = async () => {
    let connection;
    let channel;
    const connect = async () => {
        try {
            connection = await amqplib_1.default.connect(rabbitMQUrl);
            channel = await connection.createChannel();
            await channel.assertQueue(queue, { durable: true });
            connection.on("error", (err) => {
                console.error("RabbitMQ connection error:", err);
                setTimeout(connect, 5000);
            });
            connection.on("close", () => {
                console.error("RabbitMQ connection closed");
                setTimeout(connect, 5000);
            });
            await channel.consume(queue, async (msg) => {
                if (msg === null)
                    return;
                try {
                    const data = JSON.parse(msg.content.toString());
                    if (!data) {
                        throw new Error("Invalid message format");
                    }
                    await sendSIgnUp(data);
                    channel.ack(msg);
                }
                catch (err) {
                    console.error("Email consumer error (signup):", err);
                    channel.nack(msg, false, false);
                }
            }, { noAck: false });
            console.log("Email consumer started (signup)...");
        }
        catch (err) {
            console.error("Failed to start consumer(signup):", err);
            setTimeout(connect, 5000);
        }
    };
    await connect();
};
module.exports = consumeEmailQueue;
//# sourceMappingURL=consumer.js.map