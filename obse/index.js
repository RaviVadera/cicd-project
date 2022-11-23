import amqp from 'amqplib';
import * as fs from 'fs';
import path from 'path';
import { setListening } from './status.js';

const messageLogPath = path.join('/logs', 'message.log');

const mqHost = 'mq';
const mqExchange = 'topic_messages';
const mqTopic = '#';

// setup rabbitmq connection
const mqConnection = await amqp.connect(`amqp://${mqHost}`);
const mqChannel = await mqConnection.createChannel();
await mqChannel.assertExchange(mqExchange, 'topic', { durable: false });
const mqQueue = await mqChannel.assertQueue('', { exclusive: true });
mqChannel.bindQueue(mqQueue.queue, mqExchange, mqTopic);

// log every messages to file
var messageCount = 1;
const onMessageReceived = (receivedMessage) => {
    const topic = receivedMessage.fields.routingKey;
    const messageContent = receivedMessage.content.toString();
    const messageLogEntry = `${new Date().toISOString()} ${messageCount++} ${messageContent} to ${topic}\n`;
    console.log(messageLogEntry.trim());
    // append message entry to file
    fs.appendFileSync(messageLogPath, messageLogEntry);
};

// start listening for messages
await mqChannel.consume(mqQueue.queue, onMessageReceived, { noAck: true });

// report success status
setListening();