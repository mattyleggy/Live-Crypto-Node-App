var StreamerUtilities = require("./streamer-utilities.js");

class CryptoCompare {
  constructor() {
    this.currentPrice = {};
  }

  dataUnpack(data) {
		var from = data['FROMSYMBOL'];
		var to = data['TOSYMBOL'];
		var fsym = StreamerUtilities.CCC.STATIC.CURRENCY.getSymbol(from);
		var tsym = StreamerUtilities.CCC.STATIC.CURRENCY.getSymbol(to);
		var pair = from + to;
		console.log(data);
    return data;

		if (!this.currentPrice.hasOwnProperty(pair)) {
			this.currentPrice[pair] = {};
		}

		for (var key in data) {
			this.currentPrice[pair][key] = data[key];
		}

		if (this.currentPrice[pair]['LASTTRADEID']) {
			this.currentPrice[pair]['LASTTRADEID'] = parseInt(this.currentPrice[pair]['LASTTRADEID']).toFixed(0);
		}
		this.currentPrice[pair]['CHANGE24HOUR'] = StreamerUtilities.CCC.convertValueToDisplay(tsym, (this.currentPrice[pair]['PRICE'] - this.currentPrice[pair]['OPEN24HOUR']));
		this.currentPrice[pair]['CHANGE24HOURPCT'] = ((this.currentPrice[pair]['PRICE'] - this.currentPrice[pair]['OPEN24HOUR']) / this.currentPrice[pair]['OPEN24HOUR'] * 100).toFixed(2) + "%";;
		return this.displayData(this.currentPrice[pair], from, tsym, fsym);
	};

	displayData(current, from, tsym, fsym) {
		//console.log(current);
		var priceDirection = current.FLAGS;
		for (var key in current) {
			if (key == 'CHANGE24HOURPCT') {
				return ' (' + current[key] + ')';
			}	else if (key == 'LASTVOLUMETO' || key == 'VOLUME24HOURTO') {
				return StreamerUtilities.CCC.convertValueToDisplay(tsym, current[key]);
			}	else if (key == 'LASTVOLUME' || key == 'VOLUME24HOUR' || key == 'OPEN24HOUR' || key == 'OPENHOUR' || key == 'HIGH24HOUR' || key == 'HIGHHOUR' || key == 'LOWHOUR' || key == 'LOW24HOUR') {
				return StreamerUtilities.CCC.convertValueToDisplay(fsym, current[key]);
			}	else {
				return current[key];
			}
		}
	};
}

module.exports = CryptoCompare;
