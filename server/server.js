const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var CryptoCompare = require("./CryptoCompare.js");
var StreamerUtilities = require("./streamer-utilities.js");

crypto = new CryptoCompare();

app.use(express.static(publicPath));

var cryptoCompareServer = require("socket.io-client")('https://streamer.cryptocompare.com/'); // This is a client connecting to the SERVER 2

//cryptoCompare server to get up to date prices
cryptoCompareServer.on("connect",function(){
  var currentPrice = {};
  //var subscription = ['0~Poloniex~BTC~USD','5~CCCAGG~LSK~USD'];
  var subscription = ['5~CCCAGG~LSK~USD'];
  cryptoCompareServer.emit('SubAdd', { subs: subscription });
  cryptoCompareServer.on("m", function(message) {
    var messageType = message.substring(0, message.indexOf("~"));
    var res = {};
    console.log(message);
    if (messageType == StreamerUtilities.CCC.STATIC.TYPE.CURRENTAGG) {
			res = StreamerUtilities.CCC.CURRENT.unpack(message);
      response = crypto.dataUnpack(res);

      //transmit message to client socket
      io.to("lobby").emit("updatePrices", response);
		}
  });
});

//connection which passes messages onto the client
io.on('connection', (socket) => {
  console.log('New user connected');

  socket.join("lobby");

  socket.emit('updatedPrices', {
    from: "Admin",
    text: "Welcome to the program",
    createdAt:  new Date().getTime()
  });

  socket.broadcast.emit('newMessage', {
    from: "Admin",
    text: "New user joined!",
    createdAt:  new Date().getTime()
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

  socket.on('disconnect', (socket) => {
    console.log('User was disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
