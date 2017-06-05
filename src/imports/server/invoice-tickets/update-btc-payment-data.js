import Logger from '/imports/server/lib/logger';

export const updateBtcPaymentData = (options, data) => {
  check(options.ticketId, String);
  const ticket = InvoiceTickets.findOne(options.ticketId);
  if (ticket) {
    let satoshisExpectedAt = moment().add(Meteor.settings.public.acceptInviteBtcTimer, 'seconds').toDate();
    let centsAskPrice = 0;
    let satoshisExpected = 0;
    let btcUsd;
    if (data && data.USD && data.USD.last) {
      btcUsd = data.USD.last;
      centsAskPrice = btcUsd * 100;
      centsAskPrice = Math.floor(centsAskPrice);
      satoshisExpected = Math.floor(ticket.centsRequested / centsAskPrice * 100000000);
    }

    InvoiceTickets.update({
      _id: ticket._id
    }, {
      $set: {
        satoshisExpected: satoshisExpected,
        satoshisExpectedAt: satoshisExpectedAt,
        centsAskPrice: centsAskPrice,
        btcUsd: btcUsd,
      },
    });
  } else {
    Logger.error('updateBtcPaymentData', "Ticket[" + options.ticketId + "] not found");
  }
};
