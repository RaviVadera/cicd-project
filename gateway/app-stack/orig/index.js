import express from "express";
import cron from "node-cron";
import amqp from "amqplib";

const mqHost = "mq";
const mqExchange = "topic_messages";
const mqTopic = "compse140.o";
const mqConnection = await amqp.connect(`amqp://${mqHost}`);
const mqChannel = await mqConnection.createChannel();
await mqChannel.assertExchange(mqExchange, "topic", { durable: false });

const app = express();
const port = 3000;

let messageNo = 1;

// create message content
const getMessageContent = () => {
  return `MSG_${messageNo++}`;
};

const scheduledTask = cron.schedule(
  "*/3 * * * * *",
  () => {
    mqChannel.publish(mqExchange, mqTopic, Buffer.from(getMessageContent()));
  },
  { scheduled: false }
);

// return the messages entries from file
app.post("/start", (req, res) => {
  scheduledTask.start();
  res.header("Content-Type", "text/plain");
  res.status(204).send().end();
});

app.post("/stop", (req, res) => {
  scheduledTask.stop();
  res.header("Content-Type", "text/plain");
  res.status(204).send().end();
});

// start listening for HTTP requests
app.listen(port, () => {
  //scheduledTask.start();
  console.log(`ORIG listening on port ${port}`);
});
