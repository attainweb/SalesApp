TemplateController('account', {
  helpers: {
    shouldNotifyBuyer: function() {
      const user = Meteor.user();
      return user.isBuyer() && user.isApproved() && user.isWaitingOnInvite();
    },
    shouldNotifyUser: function() {
      const user = Meteor.user();
      return user.isPending() || user.isRejected();
    }
  }
});
