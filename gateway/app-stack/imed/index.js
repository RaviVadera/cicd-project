import amqp from 'amqplib';
import { setListening } from './status.js';

const mqHost = 'mq';
const mqExchange = 'topic_messages';
const mqSubscribeTopic = 'compse140.o';
const mqPublishTopic = 'compse140.i';

const mqConnection = await amqp.connect(`amqp://${mqHost}`);
const mqChannel = await mqConnection.createChannel();
await mqChannel.assertExchange(mqExchange, 'topic', { durable: false });

const mqQueue = await mqChannel.assertQueue('', { exclusive: true });
mqChannel.bindQueue(mqQueue.queue, mqExchange, mqSubscribeTopic);

const sendMessage = (receivedMessage) => {
  setTimeout(() => {
    mqChannel.publish(mqExchange, mqPublishTopic, Buffer.from(`Got ${receivedMessage}`));
    console.log(`Got ${receivedMessage}`);
  }, 1000);
};

const onMessageReceived = (receivedMessage) => {
  const messageContent = receivedMessage.content.toString();
  sendMessage(messageContent);
};

mqChannel.consume(mqQueue.queue, onMessageReceived, { noAck: true });

// report success status
setListening();