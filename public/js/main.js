var socket = io();

socket.on('connect', function() {
  console.log('Connected to server.');
  //$("#currency_form").submit();
});

socket.on('disconnect', function() {
  console.log('Disconnected from server');
});

socket.on("priceList", function(prices) {
  console.log("allPrices",prices);
  showPrices(prices);
});

socket.on("updatePrices",function(updatedPrices){
  showPrices(updatedPrices);
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
    socket.emit("addCurrency", currency);
    return false;
  });
});

function showPrices(updatedPrices) {
  for (var key in updatedPrices) {
    if (key != "count") {
      conversion = $(".coin-price[conversion='"+key+"']");
      if (conversion.length) {
          conversion.html("<div class='coin-price' conversion='"+key+"'>"+updatedPrices[key].from+"-"+updatedPrices[key].to+" "+updatedPrices[key].price+"</div>");
      } else {
          $("#current_prices").append("<div class='coin-price' conversion='"+key+"'>"+updatedPrices[key].from+"-"+updatedPrices[key].to+" "+updatedPrices[key].price+"</div>");
      }
    }
  }
  console.log("updatePrices", updatedPrices);
}
