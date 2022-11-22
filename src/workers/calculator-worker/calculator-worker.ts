import tulind from "tulind";

export class CalculatorWorker {
  async macd(klines) {
    const time_: string[] = [];
    const close: number[] = [];
    let macd = {};
    klines.map((t: number[]) => {
      time_.push(new Date(t[0]).toLocaleString());
      close.push(t[4]);
      // let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = t;
      return t;
    });
    if (time_.length > 2) {
      const output_cut = tulind.indicators.macd.start([12, 26, 9]);
      tulind.indicators.macd.indicator(
        [close],
        [12, 26, 9],
        function (err, results) {
          macd = {
            time: time_,
            macd: results[0],
            macd_signal: results[1],
            macd_histogram: results[2],
            output_cut
          };
        }
      );
      //   tulind.indicators.sma.indicator([close], [200], function (err, results) {
      //     ma = results[0];
      //   });
    }

    return macd;
  }
}
