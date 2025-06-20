import amqp, { Channel } from "amqplib";
import dotenv from "dotenv";
const sendTicketConfirmation = require("../../../service/user/email/sendTicket");

dotenv.config();

// const rabbitMQUrl =
//   process.env.RABBITMQ_PRIVATE_URL || "amqp://guest:guest@localhost:5672";
const rabbitMQUrl =
   "amqp://guest:guest@localhost:5672";
const queue = "email_ticket_confirmation";


interface QueueMessage {
  ticketId: string;
  recipientEmail: string;
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
            if (!data.ticketId || !data.recipientEmail) {
              throw new Error("Invalid message format");
            }

            await sendTicketConfirmation(
              data.ticketId,
              data.recipientEmail,
              data.metadata
            );
            channel.ack(msg);
          } catch (err) {
            console.error("Email consumer error (ticket):", err);
            channel.nack(msg, false, false);
          }
        },
        { noAck: false }
      );

      console.log("Email consumer started (ticket)...");
    } catch (err) {
      console.error("Failed to start consumer(ticket):", err);
      setTimeout(connect, 5000);
    }
  };

  await connect();
};

module.exports = consumeEmailQueue;
