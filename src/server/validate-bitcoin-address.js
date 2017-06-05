Meteor.validateBitcoinAddress = function(address) {
  // Todo: Add logic to only check for testnet addresses if we are on a test server!!!
  return BitcoinAddress.validate(address) || BitcoinAddress.validate(address, 'testnet');
};
