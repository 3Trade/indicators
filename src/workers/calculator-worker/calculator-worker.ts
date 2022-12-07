import tulind from "tulind";

export class CalculatorWorker {
  async macd(close: number[]) {
    let macd = {};
    if (close.length > 2) {
      const output_cut = tulind.indicators.macd.start([12, 26, 9]);
      tulind.indicators.macd.indicator(
        [close],
        [12, 26, 9],
        function (err, results) {
          macd = {
            macd: results[0],
            macd_signal: results[1],
            macd_histogram: results[2],
            output_cut
          };
        }
      );
    }
    return macd;
  }

  async sma(close: number[]) {
    let ma;
    tulind.indicators.sma.indicator([close], [200], function (err, results) {
      ma = results[0];
    });
    return ma;
  }
}

class MacdSpecification {
  private short;
  private long;
  private signal;
  constructor(short, long, signal) {
    this.short = short;
    this.long = long;
    this.signal = signal;
  }

  outputCut() {
    return tulind.indicators.macd.start([12, 26, 9]);
  }

  calculate(close: string[]) {
    if (close.length < 2) throw "Insuficient data to calculate macd.";
    tulind.indicators.macd.indicator(
      [close],
      [12, 26, 9],
      function (err, results) {
        this.macd = {
          // time: time_,
          macd: results[0],
          macd_signal: results[1],
          macd_histogram: results[2]
          // output_cut
        };
      }
    );
  }
}

enum Kline {
  openTime,
  openPrice,
  highPrice,
  lowPrice,
  closePrice,
  volume,
  closeTime,
  quoteAssetVolume,
  numberTrades,
  buyBaseAssetVolume,
  buyQuoteAssetVolume,
  ignored
}

// class IndicatorsWorker {
//   private _openTime: number[];
//   private _openPrice: string[];
//   private _highPrice: string[];
//   private _lowPrice: string[];
//   private _closePrice: string[];
//   private _volume: string[];
//   private _closeTime: number[];
//   private _quoteAssetVolume: string[];
//   private _numberTrades: number[];
//   private _buyBaseAssetVolume: string[];
//   private _buyQuoteAssetVolume: string[];
//   private ignored: string[];

//   constructor(klines: BinanceKlines) {
//     klines.map((kline) => {
//       this._openTime.push(kline[Kline.openTime]);
//       this._openPrice.push(kline[Kline.openPrice]);
//       this._highPrice.push(kline[Kline.highPrice]);
//       this._lowPrice.push(kline[Kline.lowPrice]);
//       this._closePrice.push(kline[Kline.closePrice]);
//       this._volume.push(kline[Kline.volume]);
//       this._closeTime.push(kline[Kline.closeTime]);
//       this._quoteAssetVolume.push(kline[Kline.quoteAssetVolume]);
//       this._numberTrades.push(kline[Kline.numberTrades]);
//       this._buyBaseAssetVolume.push(kline[Kline.buyBaseAssetVolume]);
//       this._buyQuoteAssetVolume.push(kline[Kline.buyQuoteAssetVolume]);
//     });
//   }

//   public get openTime() {
//     return this._openTime;
//   }

//   public get openPrice() {
//     return this._openPrice;
//   }

//   public get highPrice() {
//     return this._highPrice;
//   }

//   public get lowPrice() {
//     return this._lowPrice;
//   }

//   public get closePrice() {
//     return this._closePrice;
//   }

//   public get volume() {
//     return this._volume;
//   }

//   public get closeTime() {
//     return this._closeTime;
//   }

//   public get quoteAssetVolume() {
//     return this._quoteAssetVolume;
//   }

//   public get numberTrades() {
//     return this._numberTrades;
//   }

//   public get buyBaseAssetVolume() {
//     return this._buyBaseAssetVolume;
//   }

//   public get buyQuoteAssetVolume() {
//     return this._buyQuoteAssetVolume;
//   }
// }
