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

var Subscriptions = require("./classes/Subscriptions");
var HTTPCryptoCompare = require("./HTTPCryptoCompare");
var CryptoCompare = require("./CryptoCompare");
var StreamerUtilities = require("./streamer-utilities");

var subs = new Subscriptions();
var httpCrypto = new HTTPCryptoCompare();
var crypto = new CryptoCompare();

app.use(express.static(publicPath));

var request = require("request");

var cryptoCompareServer = require("socket.io-client")('https://streamer.cryptocompare.com/'); // This is a client connecting to the SERVER 2

//cryptoCompare server to get up to date prices
cryptoCompareServer.on("connect", () => {
  var currentPrice = {};
  //var subscription = ['0~Poloniex~BTC~USD','5~CCCAGG~LSK~USD'];
  //addToSubscriptions(getSubscriptions("POWR","AUD"));
  //cryptoCompareServer.emit('SubAdd', { subs: cryptoCompareSubscription });
  cryptoCompareServer.on("m", (message) => {
    var messageType = message.substring(0, message.indexOf("~"));
    var res = {};
    //console.log(message);
    //io.to("lobby").emit("updatePrices", message);
    //console.log(message);
    if (messageType == StreamerUtilities.CCC.STATIC.TYPE.CURRENTAGG) {
			res = StreamerUtilities.CCC.CURRENT.unpack(message);
      response = crypto.dataUnpack(res);
      //console.log(response);
      if (typeof response.PRICE != "undefined" && response.PRICE > 0) {
        cryptoPrices = subs.getCryptoPrices();
        cryptoPrices[response.FROMSYMBOL+"-"+response.TOSYMBOL] = {
          price: response.PRICE,
          lastUpdate: response.LASTUPDATE
        }
        allPrices = subs.getAllSubscriptionPrices();
        updatedPrices = subs.getUpdatedPrices(allPrices);
        cryptoPricesPrevious = allPrices;
        //console.log(allPrices);
        console.log(updatedPrices);
        if (updatedPrices.count > 0) {
          io.to("lobby").emit("updatePrices", updatedPrices);
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

  socket.on('getCoinList', (coins) => {

  });

  socket.on('addCurrency', (coins) => {
    subs.addSubscription(coins.from,coins.to);
    cryptoCompareServer.emit('SubAdd', { subs: subs.getSubscriptions(coins.from, coins.to)});
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
