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

// THIS HAS BEEN COMMENTED TO FULFIL THE REQUIREMENT OF PROJECT THAT
//// everything (except log information for /run-log and /messages) is in the
//// initial state and ORIG starts sending again
// SINCE THE SHUTDOWN STOPS THE CONTAINERS AND INIT STARTS AGAIN
// THE MESSAGE LOGS WILL BE CLEARED AT CONTAINER START
// CONFLICTS WITH REQUIREMENTS FROM AMQP EXERCISE
//// If OBSE is run multiple times, the file must be deleted/cleared on startup
// THIS CAN BE MOVED TO GATEWAY SO THE LOGS ARE RESET
// WHEN WHOLE STACK IS RE-LAUNCHED, HOWEVER THERE WERE
// NO SPECIFIC INSTRUCTIONS RELATED TO THIS

// re-write the log file to be empty before listening for requests
// the listening for requests can be interpreted as health check
// and is used to determine synchronization between containers
//console.log(`Re-writing message log file at ${messageLogPath}`);
//fs.writeFileSync(messageLogPath, '', { encoding: 'utf-8' });
//console.log(`Re-written message log file at ${messageLogPath}`);

// start listening for messages
await mqChannel.consume(mqQueue.queue, onMessageReceived, { noAck: true });

// report success status
setListening();