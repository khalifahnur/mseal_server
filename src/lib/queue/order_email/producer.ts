import amqp from "amqplib";
const rabbitMQUrl = process.env.RABBITMQ_PRIVATE_URL ||'amqp://guest:guest@localhost:5672';
// const rabbitMQUrl =
//    "amqp://guest:guest@localhost:5672";

interface QueueMessage {
  orderId: string;
  email: string;
  metadata?: any;
}

const publishToQueue = async (queueName: string, data: QueueMessage) => {
  let connection;
  let channel;
  try {
    connection = await amqp.connect(rabbitMQUrl);
    channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });

    const message = Buffer.from(JSON.stringify(data));
    channel.sendToQueue(queueName, message, { persistent: true });

    console.log(` [x] Sent message to ${queueName}:`, data);
  } catch (error) {
    console.error(`Error publishing to queue ${queueName}:`, error);
    throw error; // Let the caller handle the error
  } finally {
    if (channel) await channel.close();
    if (connection) await connection.close();
  }
};

module.exports = publishToQueue;