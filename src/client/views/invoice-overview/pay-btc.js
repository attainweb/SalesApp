const getCountdownFor = function(date) {
  Template.instance().recalc.get();
  return moment(date).diff(new Date(), 'seconds');
};

TemplateController('payBtc', {
  helpers: {
    btnWaiting() {
      return btnWaiting.get();
    },
    countdownExpiredFor(date) {
      return getCountdownFor(date) <= 0;
    },
    timeString(date) {
      return i18n('payBtc.countdown', getCountdownFor(date));
    },
    payDisabled(amount) {
      return (lodash.isUndefined(amount) || amount <= 0) ? 'disabled' : '';
    },
    payHidden(amount) {
      return !(lodash.isUndefined(amount) || amount <= 0)  ? 'hidden' : '';
    },
    formatAndCheck(currency, val) {
      if (val === 0) return "-";
      return Helpers.formatCurrency(currency, val);
    }
  },
  onCreated() {
    this.btnWaiting = new ReactiveVar(false);
    this.recalc = new ReactiveVar();
    this.cancelTimer = Meteor.setInterval(() => this.recalc.dep.changed(), 1000);
  }
});
