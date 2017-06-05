describe("InvoiceManager", function () {

  describe("calculateOrderFulfillmentAmount", function () {

    describe('customer bought BTC with YEN', function() {

      it('directly converts between YEN and BTC', function() {

        // We want to know how many satoshis you get for this amount of
        var yen = 1000;
        // Based on the current exchange rate for BTC to YEN (fictional here)
        var exchangeRates = { btcJpy: 10 };
        // Taking into account fixed numbers like Company fee and satoshis factor
        var companyFee = 1.0775;
        var btcToSatoshis = 100000000;

        var result = InvoiceManager.calculateOrderFulfillmentAmount('YEN', yen, exchangeRates);

        expect(result).to.equal(
          Math.floor(yen / companyFee / exchangeRates.btcJpy * btcToSatoshis)
        );

      });


    });

    describe('customer bought BTC with USD', function() {

      it('Converts from YEN to USD to BTC', function() {

        // We want to know how many satoshis you get for this amount of
        var yen = 1000;
        // Based on the current exchange rate for BTC to YEN (fictional here)
        var exchangeRates = {
          jpyUsd: 10,
          btcUsd: 10
        };
        // Taking into account fixed numbers like <COMPANY> fee and satoshis factor
        var companyFee = 1.0775;
        var btcToSatoshis = 100000000;

        var result = InvoiceManager.calculateOrderFulfillmentAmount('USD', yen, exchangeRates);

        expect(result).to.equal(
          Math.floor(yen / companyFee / exchangeRates.jpyUsd / exchangeRates.btcUsd * btcToSatoshis)
        );

      });

    });

  });

});