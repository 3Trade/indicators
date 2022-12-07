import {
  MacdSpecification,
  SmaSpecification
} from "./workers/indicator-worker/indicator-worker";
import amqp from "amqplib";
import { createClient } from "redis";
import { MongoClient } from "mongodb";
import { CalculatorWorker } from "./workers/calculator-worker/calculator-worker";
import { DBWorker } from "./workers/db-worker/db-worker";
import { TransportWorker } from "./workers/transport-worker/transport-worker";
import { delay } from "./helpers/delay";
import { IndicatorsWorker } from "./workers/klines-worker/klines-worker";
import { BinanceKline } from "./models/binance-kline";

const DBNAME = "indicators";
const QUEUE = "indicators";

let redis_connected = false;
let db;

type IndicatorsQueueMsg = {
  timeframe: string;
  pair: string;
  klines: BinanceKline[];
};

const redis_client = createClient({
  url: "redis://redis"
});

// Connection URL
const url = "mongodb://mongo:27017";
const mongo_client = new MongoClient(url);

const calculatorWorker = new CalculatorWorker();
const dbWorker = new DBWorker("indicators");

const transportWorker = new TransportWorker();

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

async function connectMongo() {
  // Use connect method to connect to the server
  await mongo_client.connect();
  console.log("Connected successfully to server");
  db = mongo_client.db(DBNAME);
  return "done.";
}

async function createIndicators(klines: BinanceKline[]) {
  const lastUpdate = klines[klines.length - 1][4];
  const time_: string[] = [];
  const close: number[] = [];
  klines.map((t) => {
    time_.push(new Date(t[0]).toLocaleString());
    close.push(Number(t[4]));
    // let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = t;
    return t;
  });
  const macd = await calculatorWorker.macd(close);
  const sma = await calculatorWorker.sma(close);
  return { time_, close, macd, sma };
}

// async function createIndicators2(klinesWorker: IndicatorsWorker) {
//   const closePrice = klinesWorker.closePrice;
//   const macd = new MacdSpecification(12, 20, 9);
//   await macd.calculate(closePrice);

//   const indicatorsWorker = new IndicatorWorker();
//   const indicators = indicatorsWorker.buildIndicators([macd]);
//   return indicators;
// }

const prepareSignalsMsg = (pair, timeframe, close, time_, indicators) => {
  return {
    pair,
    timeframe,
    close,
    time_,
    ...indicators
  };
};

const readIndicatorsQueue = () => {
  transportWorker.consume(QUEUE, async function (msg) {
    const { pair, timeframe, klines } = JSON.parse(
      msg.content.toString()
    ) as IndicatorsQueueMsg;
    console.log("INDICATOR", pair, timeframe);
    const klinesWorker = await new IndicatorsWorker(klines).prepare();
    const macdSpec = await new MacdSpecification(12, 20, 9);
    const sma = await new SmaSpecification(200);
    const indicators = await klinesWorker.calculate([macdSpec, sma]);
    const close = klinesWorker.closePrice;
    const time_ = klinesWorker.closeTime;
    // const indicators = await createIndicators(klines);
    // const indicators2 = await createIndicators2(klinesWorker);
    // const { time_, close, macd, sma } = indicators;
    const signalsMsg = prepareSignalsMsg(
      pair,
      timeframe,
      close,
      time_,
      indicators
    );

    const dbInfo = {
      time_,
      close,
      ...indicators
    };

    transportWorker.sendToQueue("signals", signalsMsg);
    dbWorker.saveIndicators(timeframe, pair, dbInfo);
  });
};

(async () => {
  // await connectRabbit();
  await transportWorker.connect();
  await connectRedis();
  await connectMongo();
  readIndicatorsQueue();
})();
