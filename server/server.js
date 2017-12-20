global.fetch = require('node-fetch');
const cc = require('cryptocompare');
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var HTTPCryptoCompare = require("./HTTPCryptoCompare");
var CryptoCompare = require("./CryptoCompare");
var StreamerUtilities = require("./streamer-utilities");

var httpCrypto = new HTTPCryptoCompare();

crypto = new CryptoCompare();

app.use(express.static(publicPath));

var request = require("request");

var cryptoCompareServer = require("socket.io-client")('https://streamer.cryptocompare.com/'); // This is a client connecting to the SERVER 2

var cryptoCompareSubscription = [];
var cryptoPrices = {};

function getSubscriptions(fsym,tsym) {
  if (fsym == "BTC") {

  } else if (tsym == "BTC") {

  }
  return [
    `5~CCCAGG~${fsym}~${tsym}`,
    `5~CCCAGG~${tsym}~${fsym}`,
    `5~CCCAGG~BTC~${fsym}`,
    `5~CCCAGG~BTC~${tsym}`,
    `5~CCCAGG~${fsym}~BTC`,
    `5~CCCAGG~${tsym}~BTC`
  ];
}

function getActualPrice(fsym,tsym) {
  if (priceExists(fsym,tsym)) {
    price = getPrice(fsym,tsym);
  } else if (priceExists(tsym,fsym)) {
    price = (1 / getPrice(tsym,fsym));
  } else {
    //from symbols
    btcToFSYM = priceExists("BTC",fsym);
    FSYMtoBTC = priceExists(fsym,"BTC");
    //to symbols
    TSYMtoBTC = priceExists(tsym,"BTC");
    btcToTSYM = priceExists("BTC",tsym);
    if ((TSYMtoBTC || btcToTSYM) && (btcToFSYM || FSYMtoBTC)) {
      tsymPrice = getPrice("BTC",tsym) || (1/getPrice(tsym,"BTC"));
      fsymPrice = getPrice(fsym,"BTC") || (1/getPrice("BTC",fsym));
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

function getPrice(fsym,tsym) {
  if (priceExists(fsym,tsym)) {
    return cryptoPrices[`${fsym}-${tsym}`].price;
  } else {
    return false;
  }
}

function priceExists(fsym,tsym) {
  return (`${fsym}-${tsym}` in cryptoPrices);
}

function addToSubscriptions(subscription) {
  for(i=0;i<subscription.length;i++) {
    cryptoCompareSubscription.push(subscription[i]);
  }
}

//cryptoCompare server to get up to date prices
cryptoCompareServer.on("connect",function(){

  var currentPrice = {};
  //var subscription = ['0~Poloniex~BTC~USD','5~CCCAGG~LSK~USD'];
  addToSubscriptions(getSubscriptions("LSK","AUD"));

  cryptoCompareServer.emit('SubAdd', { subs: cryptoCompareSubscription });
  cryptoCompareServer.on("m", function(message) {
    var messageType = message.substring(0, message.indexOf("~"));
    var res = {};
    //console.log(message);
    //io.to("lobby").emit("updatePrices", message);
    if (messageType == StreamerUtilities.CCC.STATIC.TYPE.CURRENTAGG) {
			res = StreamerUtilities.CCC.CURRENT.unpack(message);
      response = crypto.dataUnpack(res);
      if (typeof response.PRICE != "undefined" && response.PRICE > 0) {
        cryptoPrices[response.FROMSYMBOL+"-"+response.TOSYMBOL] = {
          price: response.PRICE,
          lastUpdate: response.LASTUPDATE
        }

        realPrice = getActualPrice("LSK","AUD");
        if (realPrice != null) {
          console.log(realPrice);
          io.to("lobby").emit("updatePrices", realPrice);
        }
      }

      //transmit message to client socket
      //io.to("lobby").emit("updatePrices", response);
		}
  });
});

//connection which passes messages onto the client
io.on('connection', (socket) => {
  console.log('New user connected');

  socket.join("lobby");

  socket.broadcast.emit('newMessage', {
    from: "Admin",
    text: "New user joined!",
    createdAt:  new Date().getTime()
  });

  socket.on('updatePrices', (message) => {
    console.log("oh");
  });

  socket.on('createMessage', (message) => {
    console.log('createMessage', message);

    // socket.broadcast.emit('newMessage', {
    //   from: message.from,
    //   text: message.text,
    //   createdAt: new Date().getTime()
    // });

    //io.emit to all users - socket just to that specific socket
    io.emit('newMessage', {
      from: message.from,
      text: message.text,
      createdAt: new Date().getTime()
    })
  });

/*
  socket.on('updateCurrency', (currency) => {
    var getCurrentPrice = (currency) => {
      httpCrypto.getPrice(currency.from,currency.to,(response) => {
        console.log(currency.from, currency.to, response[currency.to]);
        socket.emit('loadPrices', {
          from: currency.from,
          to: currency.to,
          currentPrice: response[currency.to],
          timestamp: new Date().getTime()
        });
      });
    };

    getCurrentPrice(currency);
    clearInterval(currentPriceInterval);
    var currentPriceInterval = "";
    currentPriceInterval = setInterval(()=>{
      getCurrentPrice(currency);
    },50000);
  });

  */
  socket.on('disconnect', (socket) => {
    console.log('User was disconnected');
  });

});


server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
