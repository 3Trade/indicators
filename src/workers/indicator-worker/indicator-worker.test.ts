import { IndicatorsWorker } from "../klines-worker/klines-worker";
import { MacdSpecification } from "./indicator-worker";

const close = [
  81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53,
  86.54, 86.89, 87.77, 87.29
];

class IndicatorsMock extends IndicatorsWorker {
  constructor() {
    super([]);
    this.closePrice = close;
  }
}
describe("Test indicator", () => {
  test("Should calculate the correct MACD", async () => {
    const indicatorMock = new IndicatorsMock();
    const macdSpec = new MacdSpecification(2, 5, 9);
    const res = await indicatorMock.calculate([macdSpec]);

    const {
      macd: { macd, macd_signal, macd_histogram }
    } = res;
    expect(macd).toEqual([
      0.6177777777777749, 0.3512757201646082, 0.11065843621399551,
      0.41593049839963214, 0.5780064014631847, 0.42224406848549734,
      0.6837982014936728, 0.9266328529413528, 0.8913443637205347,
      0.9787592852891152, 0.6206827600178855
    ]);
    expect(macd_signal).toEqual([
      0.6177777777777749, 0.5644773662551416, 0.47371358024691235,
      0.4621569638774563, 0.48532685139460197, 0.47271029481278104,
      0.5149278761489594, 0.5972688715074381, 0.6560839699500575,
      0.720619033017869, 0.7006317784178723
    ]);
    expect(macd_histogram).toEqual([
      0, -0.21320164609053338, -0.36305514403291683, -0.046226465477824163,
      0.09267955006858275, -0.0504662263272837, 0.16887032534471336,
      0.32936398143391465, 0.23526039377047725, 0.25814025227124615,
      -0.0799490183999868
    ]);
  });
});
