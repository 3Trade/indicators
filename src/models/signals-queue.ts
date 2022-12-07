export interface ISignalsQueueMessage {
  pair: string;
  timeframe: string;
  indicators: {
    [name: string]: any;
  };
}
