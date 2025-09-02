import amqp, { Channel } from "amqplib";
import dotenv from "dotenv";

const sendResetCode = require("../../../../service/admin/email/sendVerifyCode");

dotenv.config();

const rabbitMQUrl =
  process.env.RABBITMQ_PRIVATE_URL || "amqp://guest:guest@localhost:5672";
// const rabbitMQUrl =
//    "amqp://guest:guest@localhost:5672";
const queue = "verify_code";


interface QueueMessage {
  resetCode:string
  email:string
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

            await sendResetCode(
              data
            );
            channel.ack(msg);
          } catch (err) {
            console.error("Email consumer error (admin_verification):", err);
            channel.nack(msg, false, false);
          }
        },
        { noAck: false }
      );

      console.log("Email consumer started (admin_verification)...");
    } catch (err) {
      console.error("Failed to start consumer(admin_verification):", err);
      setTimeout(connect, 5000);
    }
  };

  await connect();
};

module.exports = consumeEmailQueue;
