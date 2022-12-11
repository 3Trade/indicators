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

  outputCut() {
    return tulind.indicators.sma.start([200]);
  }

  async calculate(klinesWorker: IndicatorsWorker) {
    return new Promise<number[]>(async (resolve, reject) => {
      tulind.indicators.sma.indicator(
        [klinesWorker.closePrice],
        [this.period],
        function (err, results) {
          const output = Array(this.outputCut()).fill(null).concat(results[0]);
          resolve(output);
        }.bind(this)
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
      const cut = this.outputCut();
      tulind.indicators.macd.indicator(
        [klinesWorker.closePrice],
        [this.short, this.long, this.signal],
        function (err, results) {
          const output = {
            macd: Array(cut).fill(null).concat(results[0]),
            macd_signal: Array(cut).fill(null).concat(results[1]),
            macd_histogram: Array(cut).fill(null).concat(results[2])
          };
          this.output = output;
          resolve(output);
        }.bind(this)
      );
    });
  }
}
