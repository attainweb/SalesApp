InvoiceManager.calculateOrderFulfillmentAmount = function (strategy, yen, exchangeRates) {
  // Calculate the order fulfillment amount in satoshis based on the
  // the yen amount, Company fee (7.75%) and the exchange rates
  var yenAfterCompanyFee = yen / 1.0775;
  var bitcoinsExpected = 0;

  if (strategy === 'USD') {
    var dollarsExpected = yenAfterCompanyFee / exchangeRates.jpyUsd;
    bitcoinsExpected = dollarsExpected / exchangeRates.btcUsd;
  } else if (strategy === 'YEN') {
    bitcoinsExpected = yenAfterCompanyFee / exchangeRates.btcJpy;
  } else {
    throw new Error(`Unknown calculation strategy <${strategy}>`);
  }
  // Satoshis are the smallest bitcoin unit -> no fractions allowed!
  return Math.floor(bitcoinsExpected * 100000000);
};