import { bankList } from '/imports/lib/shared/bank-list';

TemplateController('bankSelector', {
  props: new SimpleSchema({
    'class': {
      type: String,
    },
    returnSelectedBank: {
      type: Function,
      optional: true
    },
  }),

  onCreated() {
  },

  helpers: {
    getBanks() {
      return bankList;
    },
  },

  events: {
    'change select[name="bank"]': function(e) {
      const selectedBank = bankList[$(e.target).val()];
      this.props.returnSelectedBank(selectedBank);
    }
  }
});
