import Logger from '/imports/server/lib/logger';

export const createDistributorWallet = (userId) => {
  let user = Meteor.users.findOne(userId);
  Meteor.Backend.createWallet(user._id, (err, res) => {
    if (err) {
      Logger.error('Error response while attempting to create invoice wallet for distributor: '
        + user._id + ', error code: '
        + err.code + ', message:'
        + err
        + ', url:  + backend api/invoiceWallets');
      return;
    } else {
      // store walletID
      Meteor.users.rawCollection().update(
        {
          "_id": user._id
        }, {
          $set: {
            "personalInformation.invoiceWalletId": res.data.walletId,
            'personalInformation.hasInvoiceWallet': true,
            updatedAt: new Date(),
          }
        }, {
          "upsert": true
        }, (error) => {
          if (error) {
            Logger.error('Error updating holding wallet for distributor: ' + user._id);
          }
        }
      );
      const updatedUser = Meteor.users.findOne(userId);
      Logger.info('Invoice Wallet Id: ' + updatedUser.personalInformation.invoiceWalletId + ' created for Distributor with Id: ' + user._id);
    }
  });
};
