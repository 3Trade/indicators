import { BinanceKline } from "../../models/binance-kline";

export class IndicatorsWorker {
  public klines: BinanceKline[];
  private _openTime: number[] = [];
  private _openPrice: number[] = [];
  private _highPrice: string[] = [];
  private _lowPrice: string[] = [];
  private _closePrice: number[] = [];
  private _volume: string[] = [];
  private _closeTime: number[] = [];
  private _quoteAssetVolume: string[] = [];
  private _numberTrades: number[] = [];
  private _buyBaseAssetVolume: string[] = [];
  private _buyQuoteAssetVolume: string[] = [];
  private ignored: string[];

  constructor(klines: BinanceKline[]) {
    this.klines = klines;
  }

  async prepare() {
    this.klines.map((kline) => {
      this._openTime.push(kline[0]);
      this._openPrice.push(Number(kline[1]));
      this._highPrice.push(kline[2]);
      this._lowPrice.push(kline[3]);
      this._closePrice.push(Number(kline[4]));
      this._volume.push(kline[5]);
      this._closeTime.push(kline[6]);
      this._quoteAssetVolume.push(kline[7]);
      this._numberTrades.push(kline[8]);
      this._buyBaseAssetVolume.push(kline[9]);
      this._buyQuoteAssetVolume.push(kline[10]);
    });
    return this;
  }

  public get openTime() {
    return this._openTime;
  }

  public get openPrice() {
    return this._openPrice;
  }

  public get highPrice() {
    return this._highPrice;
  }

  public get lowPrice() {
    return this._lowPrice;
  }

  public get closePrice() {
    return this._closePrice;
  }

  public set closePrice(close) {
    this._closePrice = close;
  }

  public get volume() {
    return this._volume;
  }

  public get closeTime() {
    return this._closeTime;
  }

  public get quoteAssetVolume() {
    return this._quoteAssetVolume;
  }

  public get numberTrades() {
    return this._numberTrades;
  }

  public get buyBaseAssetVolume() {
    return this._buyBaseAssetVolume;
  }

  public get buyQuoteAssetVolume() {
    return this._buyQuoteAssetVolume;
  }

  async calculate(indicators: any[]): Promise<{ [name: string]: any }> {
    const result = {};
    for (let i = 0; i < indicators.length; i++) {
      result[indicators[i].name] = await indicators[i].calculate(this);
    }

    return result;
  }
}
