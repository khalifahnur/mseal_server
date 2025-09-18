import amqp, { Channel } from "amqplib";
import dotenv from "dotenv";
const sendMembershipConfrimation = require("../../../service/user/email/sendMembership")

dotenv.config();

const rabbitMQUrl =
  process.env.RABBITMQ_PRIVATE_URL || "amqp://guest:guest@localhost:5672";
// const rabbitMQUrl =
//    "amqp://guest:guest@localhost:5672";
const queue = "email_membership_confirmation";


interface QueueMessage {
  firstName: string;
  email: string;
  membershipTier: string;
  purchaseDate: string;
  transcationId: string;
  billingPeriod: string;
  paymentMethod: string;
  amount: string;
  nextBillingDate: string;
  recurringAmount: string;
}

const consumeEmailQueue = async () => {
  let connection;
  let channel: Channel;

  const connect = async () => {
    try {
      connection = await amqp.connect(rabbitMQUrl);
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

      await channel.consume(
        queue,
        async (msg) => {
          if (msg === null) return;

          try {
            const data: QueueMessage = JSON.parse(msg.content.toString());
            if (!data) {
              throw new Error("Invalid message format");
            }

            await sendMembershipConfrimation(
              data
            );
            channel.ack(msg);
          } catch (err) {
            console.error("Email consumer error (membership):", err);
            channel.nack(msg, false, false);
          }
        },
        { noAck: false }
      );

      console.log("Email consumer started (membership)...");
    } catch (err) {
      console.error("Failed to start consumer(membership):", err);
      setTimeout(connect, 5000);
    }
  };

  await connect();
};

module.exports = consumeEmailQueue;
