import amqp, { Channel } from "amqplib";
import dotenv from "dotenv";

const sendSIgnIn = require("../../../../service/user/email/sendSignIn")

dotenv.config();

const rabbitMQUrl =
  process.env.RABBITMQ_PRIVATE_URL || "amqp://guest:guest@localhost:5672";
// const rabbitMQUrl =
//    "amqp://guest:guest@localhost:5672";
const queue = "sign_in_detected";


interface QueueMessage {
  firstName: string;
  signinDateTime: string;
  deviceInfo: string;
  browserInfo:string;
  ipAddress:string;
  location:string;
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

            await sendSIgnIn(
              data
            );
            channel.ack(msg);
          } catch (err) {
            console.error("Email consumer error (signin):", err);
            channel.nack(msg, false, false);
          }
        },
        { noAck: false }
      );

      console.log("Email consumer started (signin)...");
    } catch (err) {
      console.error("Failed to start consumer(signin):", err);
      setTimeout(connect, 5000);
    }
  };

  await connect();
};

module.exports = consumeEmailQueue;
