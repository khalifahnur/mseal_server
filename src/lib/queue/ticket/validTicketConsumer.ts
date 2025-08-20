import amqp, { Channel } from "amqplib";
import dotenv from "dotenv";
const sendTicketConfirmation = require("../../../service/user/email/sendValidTicket");

dotenv.config();

const rabbitMQUrl =
  process.env.RABBITMQ_PRIVATE_URL || "amqp://guest:guest@localhost:5672";
// const rabbitMQUrl =
//    "amqp://guest:guest@localhost:5672";
const queue = "email_valid_ticket_confirmation";

interface QueueMessage {
  ticketId: string;
  recipientEmail: string;
  fullName?: string;
  eventName?: string;
  scanTime?: any;
  date?: any;
  venue?: string;
  seat?: string;
  quantity?: any;
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

            await sendTicketConfirmation({
              ticketId: data.ticketId,
              recipientEmail: data.recipientEmail,
              fullName: data.fullName,
              eventName: data.eventName,
              scanTime: data.scanTime,
              date: data.date,
              venue: data.venue,
              seat: data.seat,
              quantity: data.quantity,
            });
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
