global.fetch = require('node-fetch');
var request = require("request");

class HTTPCryptoCompare {
  constructor() {
    this.currentPrices = {};
  }

  getPrice(from, to, callback) {
    var url = 'https://min-api.cryptocompare.com/data/price?fsym='+from+'&tsyms='+to;
    console.log(from, to);
    request({
        url: url,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          callback(body);
        }
    })
  }
}

module.exports = HTTPCryptoCompare;
