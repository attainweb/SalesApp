import SalesPredictor from '/imports/lib/sales-predictor.js';
// import { invoicedAndpaidStates, paidStates } from '/imports/server/invoice-ticket-state-machine';

const capitalizeFirstLetter = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

TemplateController('saleOverview', {
  state: {
    tickets: [ {amount: 13, curState: 'paid'} ],
    curTaa: 0,
    curOct: 0,
    timerId: null,
  },

  onCreated() {
  },

  events: {
    'submit'(event, template) {
      event.preventDefault();
      const taa = template.find('input[name=taa]').value;
      const oct = template.find('input[name=oct]').value;

      this.state.curTaa = taa;
      this.state.curOct = oct;
      this.state.tickets = [];

      Meteor.clearInterval(this.state.timerId);


      this.state.timerId = Meteor.setInterval(() => {
        this.payTimer();
        this.workflowTimer();
        this.ticketTimer();
      }, 20);
    }
  },

  helpers: {
    simTickets: function() {
      return this.state.tickets;
    },
    simOct: function() {
      return this.state.curOct;
    },
    simAip: function() {
      return this.getAmount(['invoiced', 'paid']);
    },
    simAp: function() {
      return this.getAmount(['paid']);
    },
    currentTranche: function() {
      return Meteor.settings.public.salesLimits.currentTranche;
    },
    salesStartedCSS: function() {
      return "sales-started-" + Meteor.settings.public.salesStarted;
    },
    salesStartedText: function() {
      return i18n( 'dashboard.settings.salesStarted' + capitalizeFirstLetter(Meteor.settings.public.salesStarted + "") );
    },
    salesStartedIcon: function() {
      if (Meteor.settings.public.salesStarted) {
        return "fa-play";
      }
      return "fa-stop";
    },
    taa: function() {
      const tranche = Meteor.settings.public.salesLimits.currentTranche;
      const settings = Meteor.settings.public.salesLimits.tranches[tranche];
      return settings.totalAmountAvailable || 0;
    },
    oct: function() {
      const tranche = Meteor.settings.public.salesLimits.currentTranche;
      const settings = Meteor.settings.public.salesLimits.tranches[tranche];
      return settings.overCapacityTolerance || 0;
    },
    aipCount: function() {
      return Sums.getCount('aiTotalCents') + Sums.getCount('apTotalCents');
    },
    apCount: function() {
      return Sums.getCount('apTotalCents');
    },
    aipSum: function() {
      return Math.round(Sums.getSum('apTotalCents') + Sums.getSum('aiTotalCents') / 100);
    },
    apSum: function() {
      return Math.round(Sums.getSum('apTotalCents'));
    },
  },

  private: {
    workflowTimer: function() {
      let t = _.find(this.state.tickets, function(ticket) { return ticket.curState === 'new'; });
      if (t) {

        // Randomizer
        let sp = new SalesPredictor({
          totalAmountAvailable: this.state.curTaa,
          overCapacityTolerance: this.state.curOct,
          amountInvoicedOrPaid: this.getAip.bind(this),
          amountPaid: this.getAp.bind(this),
        });

        if (sp.salesGoalReached()) {
          Meteor.clearInterval(this.state.timerId);
        }

        const allowSale = sp.allowSale(t.amount);
        if (allowSale) {
          t.curState = 'invoiced';
        } else {
          t.curState = 'expire';
        }
      }

    },
    ticketTimer: function() {
      this.createRandomTicket();
    },
    payTimer: function() {
      let t = _.find(this.state.tickets, function(ticket) { return ticket.curState === 'invoiced'; });
      if (t) {
        if (this.getRandomIntInclusive(1, 4 ) === 4) {
          t.curState = 'paid';
        } else {
          t.curState = 'expire';
        }
      }
    },
    getAmount: function(states) {
      return _.reduce(this.state.tickets, function(memo, ticket) {
        if (_.contains(states, ticket.curState) ) {
          return memo + ticket.amount;
        } else {
          return memo;
        }
      }, 0);
    },
    getAip: function() { return this.getAmount(['invoiced', 'paid']);},
    getAp: function() { return this.getAmount(['paid']);},
    createRandomTicket: function() {
      // console.log("createRandomTicket", this.state.tickets.length, this.state.curTaa);
      const am = this.getRandomIntInclusive(1, this.state.curTaa * 0.3 );
      this.state.tickets.push({amount: am, curState: 'new' });
      this.state.tickets = this.state.tickets;
    },
    getRandomIntInclusive: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

  },

});
