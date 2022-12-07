import { resolve } from "path";
import tulind from "tulind";
import { Indicator } from "../../models/indicator";
import { IndicatorsWorker } from "../klines-worker/klines-worker";

// interface IIndicator {
//   name: string;
//   output: any;
// }

// export class IndicatorWorker {
//   private _indicators: {};
//   buildIndicators(indicators: IIndicator[]) {
//     indicators.map((indicator: any) => {
//       this._indicators[indicator.name] = indicator.output;
//     });
//     return this._indicators;
//   }
// }

export class SmaSpecification extends Indicator {
  public name = "sma";
  public period;
  constructor(period: number) {
    super();
    this.period = period;
  }
  async calculate(klinesWorker: IndicatorsWorker) {
    return new Promise<number[]>(async (resolve, reject) => {
      tulind.indicators.sma.indicator(
        [klinesWorker.closePrice],
        [this.period],
        function (err, results) {
          resolve(results[0]);
        }
      );
    });
  }
}

export class MacdSpecification extends Indicator {
  public name = "macd";
  public short;
  public long;
  public signal;
  public output;
  constructor(short, long, signal) {
    super();
    this.short = short;
    this.long = long;
    this.signal = signal;
  }

  outputCut() {
    return tulind.indicators.macd.start([this.short, this.long, this.signal]);
  }

  async calculate(klinesWorker: IndicatorsWorker): Promise<{
    macd: number[];
    macd_signal: number[];
    macd_histogram: number[];
  }> {
    return new Promise<{
      macd: number[];
      macd_signal: number[];
      macd_histogram: number[];
    }>(async (resolve, reject) => {
      tulind.indicators.macd.indicator(
        [klinesWorker.closePrice],
        [this.short, this.long, this.signal],
        function (err, results) {
          const output = {
            macd: results[0],
            macd_signal: results[1],
            macd_histogram: results[2],
            output_cut: this.outputCut()
          };
          this.output = output;
          resolve(output);
        }.bind(this)
      );
    });
  }
}
