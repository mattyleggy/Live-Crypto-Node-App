class Subscriptions {
  constructor() {
    this.subscriptionPairs = [];
    this.cryptoCompareSubscription = [];
    this.cryptoPrices = {};
    this.cryptoPricesPrevious = {};
  }

  getSubscriptionPairs() {
    return this.subscriptionPairs;
  }

  getCryptoPrices() {
    return this.cryptoPrices;
  }

  getPreviousCryptoPrices() {
    return this.cryptoPricesPrevious;
  }

  addSubscription(fsym,tsym) {
    this.subscriptionPairs.push({
      from: fsym,
      to: tsym
    });
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

  getActualPrice(fsym,tsym) {
    var price;
    if (this.priceExists(fsym,tsym)) {
      price = this.getPrice(fsym,tsym);
    } else if (this.priceExists(tsym,fsym)) {
      price = (1/this.getPrice(tsym,fsym));
    } else {
      //from symbols
      var btcToFSYM = this.priceExists("BTC",fsym);
      var FSYMtoBTC = this.priceExists(fsym,"BTC");
      //to symbols
      var TSYMtoBTC = this.priceExists(tsym,"BTC");
      var btcToTSYM = this.priceExists("BTC",tsym);
      if ((TSYMtoBTC || btcToTSYM) && (btcToFSYM || FSYMtoBTC)) {
        var tsymPrice = this.getPrice("BTC",tsym) || (1/this.getPrice(tsym,"BTC"));
        var fsymPrice = this.getPrice(fsym,"BTC") || (1/this.getPrice("BTC",fsym));
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
      return this.cryptoPrices[`${fsym}-${tsym}`].price;
    } else {
      return false;
    }
  }

  priceExists(fsym,tsym) {
    return (`${fsym}-${tsym}` in this.cryptoPrices);
  }

  addToSubscriptions(subscription) {
    for(i=0;i<subscription.length;i++) {
      this.cryptoCompareSubscription.push(subscription[i]);
    }
  }

  getAllSubscriptionPrices() {
    var pairs = {};
    for(var i=0;i<this.subscriptionPairs.length;i++) {
      var from = this.subscriptionPairs[i].from
      var to = this.subscriptionPairs[i].to;
      var price = this.getActualPrice(this.subscriptionPairs[i].from,this.subscriptionPairs[i].to)
      if (price != null) {
        pairs[`${from}-${to}`] = {
          from: from,
          to: to,
          price: price.price
        }
      }
    }
    return pairs;
  }

  getUpdatedPrices(newPrices) {
    var uPrices = {};
    var uCount = 0;
    for(var key in newPrices) {
      if (key != "count") {
        if (key in this.cryptoPricesPrevious) {
          if (JSON.stringify(this.cryptoPricesPrevious[key]) !== JSON.stringify(newPrices[key])) {
            uPrices[key] = newPrices[key];
            uCount++;
          }
        } else {
          uPrices[key] = newPrices[key];
          uCount++;
        }
      }
    }
    uPrices["count"] = uCount;
    return uPrices;
  }
}

module.exports = Subscriptions;
