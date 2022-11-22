import amqp from "amqplib";
import { createClient } from "redis";
import { MongoClient } from "mongodb";
import { CalculatorWorker } from "./workers/calculator-worker/calculator-worker";
import { DBWorker } from "./workers/db-worker/db-worker";

const DBNAME = "indicators";
const QUEUE = "indicators";

let rabbit_connected = false;
let redis_connected = false;
let rabbitMQConnection;
let rabbitMQChannel;
let db;

const redis_client = createClient({
  url: "redis://redis"
});

// Connection URL
const url = "mongodb://mongo:27017";
const mongo_client = new MongoClient(url);

const calculatorWorker = new CalculatorWorker();
const dbWorker = new DBWorker("indicators");

async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

const connectRedis = async () => {
  console.log("Starting Redis connection...");
  while (!redis_connected) {
    console.log("Trying to connect to redis...");
    try {
      await redis_client.connect();
      redis_connected = true;
      console.log("Redis Connected!!!");
    } catch (err) {
      console.log("Error on connecting Redis. Retrying...", err);
      await delay(5000);
    }
  }
};

const connectRabbit = async () => {
  console.log("Starting Rabbit connection...");
  let attempt = 1;
  while (!rabbit_connected) {
    console.log(`Trying to connect to RabbitMQ. Attempt ${attempt}`);
    try {
      rabbitMQConnection = await amqp.connect("amqp://guest:guest@rabbit:5672");
      rabbitMQChannel = await rabbitMQConnection.createChannel();
      // await rabbitMQChannel.assertQueue("indicators", { durable: false });
      rabbit_connected = true;
      console.log("Rabbit Connectedto indicators queue!!");
    } catch {
      console.log("Error on connecting Rabbit. Retrying...");
      await delay(5000);
    }
    attempt++;
  }
};

async function connectMongo() {
  // Use connect method to connect to the server
  await mongo_client.connect();
  console.log("Connected successfully to server");
  db = mongo_client.db(DBNAME);
  return "done.";
}

async function calcFactory(klines) {
  const macd = await calculatorWorker.macd(klines);
  return { macd };
}

const readIndicatorsQueue = () => {
  rabbitMQChannel.consume(
    QUEUE,
    async function (msg) {
      const { pair, timeframe, klines } = JSON.parse(msg.content.toString());
      const indicators = await calcFactory(klines);
      dbWorker.saveIndicators(timeframe, pair, indicators);
    },
    {
      noAck: true
    }
  );
};

(async () => {
  await connectRabbit();
  await connectRedis();
  await connectMongo();
  readIndicatorsQueue();
})();
