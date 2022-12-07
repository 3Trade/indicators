import { IndicatorsWorker } from "../workers/klines-worker/klines-worker";

export abstract class Indicator {
  abstract name: string;
  abstract calculate(klinesWorker: IndicatorsWorker): Promise<any>;
}
