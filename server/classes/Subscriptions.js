class Subscriptions {
  constructor() {

  }

  getSubscriptions(fsym,tsym) {
    if (fsym == "BTC" || tsym == "BTC") {
      return [
        `5~CCCAGG~${fsym}~${tsym}`,
        `5~CCCAGG~${tsym}~${fsym}`];
    } else {
      return [
        `5~CCCAGG~${fsym}~${tsym}`,
        `5~CCCAGG~${tsym}~${fsym}`,
        `5~CCCAGG~BTC~${fsym}`,
        `5~CCCAGG~BTC~${tsym}`,
        `5~CCCAGG~${fsym}~BTC`,
        `5~CCCAGG~${tsym}~BTC`
      ];
    }
  }

  getRecentPrice(fsym,tsym) {
    if (this.priceExists(fsym,tsym)) {
      price = this.getPrice(fsym,tsym);
    } else if (this.priceExists(tsym,fsym)) {
      price = (1/this.getPrice(tsym,fsym));
    } else {
      //from symbols
      btcToFSYM = this.priceExists("BTC",fsym);
      FSYMtoBTC = this.priceExists(fsym,"BTC");
      //to symbols
      TSYMtoBTC = this.priceExists(tsym,"BTC");
      btcToTSYM = this.priceExists("BTC",tsym);
      if ((TSYMtoBTC || btcToTSYM) && (btcToFSYM || FSYMtoBTC)) {
        tsymPrice = this.getPrice("BTC",tsym) || (1/this.getPrice(tsym,"BTC"));
        fsymPrice = this.getPrice(fsym,"BTC") || (1/this.getPrice("BTC",fsym));
        price = fsymPrice * tsymPrice
      } else {
        return null;
      }
    }
    return {
      fromSymbol: fsym,
      toSymbol: tsym,
      price: price
    }
  }

  getPrice(fsym,tsym) {
    if (this.priceExists(fsym,tsym)) {
      return cryptoPrices[`${fsym}-${tsym}`].price;
    } else {
      return false;
    }
  }

  priceExists(fsym,tsym) {
    return (`${fsym}-${tsym}` in this.cryptoPrices);
  }
}

module.exports = Subscriptions;
