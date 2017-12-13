var socket = io();

socket.on('connect', function() {
  console.log('Connected to server.');
});

socket.on('disconnect', function() {
  console.log('Disconnected from server');
});

socket.on("updatePrices",function(message){
  console.log("updatePrices", message);
});

socket.on("loadPrices",function(prices){
  $("#current_prices").html(prices.from + " to " + prices.to + ":");
  $("#current_prices").append(prices.currentPrice);
});

$(function(){
  $(document).on("submit","#currency_form",function(){
    currency = {
      from: $("#currency_from").val(),
      to: $("#currency_to").val(),
    }
    socket.emit("updateCurrency", currency);
    return false;
  });
});
