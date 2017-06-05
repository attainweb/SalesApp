module.exports = function() {
  this.Before(function() {
    // Create the email stub
    server.execute(() => {
      Meteor.Backend = {
        getInvoiceAddress(ticketId, cb) {
          cb(undefined, {
            data: {
              address: "A_BTC_ADDRESS"
            }
          });
        }
      };
    });
  });
};
