"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = __importDefault(require("amqplib"));
const rabbitMQUrl = process.env.RABBITMQ_PRIVATE_URL || 'amqp://guest:guest@localhost:5672';
const publishToQueue = async (queueName, data) => {
    let connection;
    let channel;
    try {
        connection = await amqplib_1.default.connect(rabbitMQUrl);
        channel = await connection.createChannel();
        await channel.assertQueue(queueName, { durable: true });
        const message = Buffer.from(JSON.stringify(data));
        channel.sendToQueue(queueName, message, { persistent: true });
        console.log(` [x] Sent message to ${queueName}:`, data);
    }
    catch (error) {
        console.error(`Error publishing to queue ${queueName}:`, error);
        throw error;
    }
    finally {
        if (channel)
            await channel.close();
        if (connection)
            await connection.close();
    }
};
module.exports = publishToQueue;
//# sourceMappingURL=producer.js.map