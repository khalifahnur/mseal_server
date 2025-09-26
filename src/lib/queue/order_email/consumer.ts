import amqp, { Channel } from "amqplib";
import dotenv from "dotenv";

const sendOrderConfirmation = require("../../../service/user/email/sendOrder");

dotenv.config();

const rabbitMQUrl =
  process.env.RABBITMQ_PRIVATE_URL || "amqp://guest:guest@localhost:5672";
// const rabbitMQUrl = "amqp://guest:guest@localhost:5672";
const queue = "email_order_confirmation";

interface QueueMessage {
  order: {
    userInfo: string;
    items: {
      productId: string;
      quantity: number;
      price: number;
      size?: string;
      customization?: string;
    }[];
    totalAmount: number;
    shippingAddress: {
      street: string;
      city: string;
      country: string;
      postalCode: string;
      deliveryType: string;
      collectionCenter: string;
    };
    phoneNumber: number;
    transactionReference: string;
    status: string;
    paymentStatus: string;
    orderId: string;
    createdAt:Date
  };
  email: string;
  metadata?: any;
}

const consumeEmailQueue = async () => {
  let connection;
  let channel: Channel;

  const connect = async () => {
    try {
      connection = await amqp.connect(rabbitMQUrl);
      channel = await connection.createChannel();
      await channel.assertQueue(queue, { durable: true });

      // Handle connection errors
      connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err);
        setTimeout(connect, 5000); // Reconnect after 5 seconds
      });

      connection.on("close", () => {
        console.error("RabbitMQ connection closed");
        setTimeout(connect, 5000);
      });

      await channel.consume(
        queue,
        async (msg) => {
          if (msg === null) return;

          try {
            const data: QueueMessage = JSON.parse(msg.content.toString());
            if (!data.order || !data.email) {
              throw new Error("Invalid message format");
            }

            console.log(data);


            await sendOrderConfirmation(data.order, data.email, data.metadata);
            channel.ack(msg);
          } catch (err) {
            console.error("Email consumer error(order):", err);
            channel.nack(msg, false, false);
          }
        },
        { noAck: false }
      );

      console.log("Email consumer started (order)...");
    } catch (err) {
      console.error("Failed to start consumer:", err);
      setTimeout(connect, 5000);
    }
  };

  await connect();
};

module.exports = consumeEmailQueue;
