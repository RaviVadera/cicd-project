import amqp from 'amqplib';

const mqHost = 'mq';
const mqExchange = 'topic_messages';
const mqTopic = 'compse140.o';

const mqConnection = await amqp.connect(`amqp://${mqHost}`);
const mqChannel = await mqConnection.createChannel();
await mqChannel.assertExchange(mqExchange, 'topic', { durable: false });

var messageNo = 1;

// create message content
const getMessageContent = () => {
  return `MSG_${messageNo++}`;
};

// idle out for 1 day after messages are sent
// I tried making the ORIG like an async task executor
// but did not succeed, this should still be enough
// as requirements did not specify any constraints
// related to idling the ORIG
const waitForExit = () => {
  setTimeout(() => { }, 1 * 24 * 60 * 60 * 1000);
};

// wait for 3 seconds before sending message
const sendMessageWithTimeout = (count) => {
  setTimeout(() => {
    if (count > 0) {
      mqChannel.publish(mqExchange, mqTopic, Buffer.from(getMessageContent()));
      sendMessageWithTimeout(count - 1);
    }
    else
      waitForExit();
  }, 3000);
};

// first message should be sent without timeout
mqChannel.publish(mqExchange, mqTopic, Buffer.from(getMessageContent()));
// consecutive 2 messages with timeout
sendMessageWithTimeout(2);

// /**
//  * @param {Task} task 
//  */
// const executeTask = (task) => {
//     if (!task) {
//         setTimeout(() => {
//             waitForTask(undefined);
//         }, 10 * 1000);
//     } else {
//         setTimeout(() => {
//             mqChannel.publish(mqExchange, mqTopic, Buffer.from(task.messageToSend));
//         }, task.waitMs);
//     }
// };

// const waitForTask = () => {
//     var running = true;

//     function killProcess() {
//         running = false;
//     }

//     process.on('SIGTERM', killProcess);
//     process.on('SIGINT', killProcess);
//     process.on('uncaughtException', function (e) {
//         console.log('[uncaughtException] app will be terminated: ', e.stack);
//         killProcess();
//     });

//     function run() {
//         setTimeout(function () {
//             if (running) run();
//         }, 10);
//     }

//     run();
// };