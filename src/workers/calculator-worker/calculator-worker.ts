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
