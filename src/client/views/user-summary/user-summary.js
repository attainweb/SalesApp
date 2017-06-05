import { i18nAlert } from '/imports/client/i18n-alert';
const I18N_ERROR_NAMESPACE = 'userSummary';

TemplateController('userSummary', {
  // props: Schemas.User, // Causes a bug as the Schema strips off _id

  'private': {
    unwatchCallback(userUnderReview) {
      const onWatchChangeCb =  Template.currentData().options.onWatchChangeCb;
      return function() {
        Meteor.call("unwatchUser", userUnderReview._id, function(err) {
          if (err) {
            i18nAlert(err, I18N_ERROR_NAMESPACE);
          }
          if (onWatchChangeCb) onWatchChangeCb();
        });
      };
    },
    getUser() {
      return Template.currentData().user;
    },
    tryReviewingUser(user, takeOverReviewee = false) {
      Session.set('ReviewedUser', user.personalInformation.hasBeenReviewed);
      Meteor.call('startReviewing', user._id, takeOverReviewee, (error) => {
        if (error) {
          switch (error.error) {
            case 'reviewedByOtherOfficer':
              // Display the take over reviewee modal dialog
              bootbox.dialog({
                message: i18n('userSummary.takeOverRevieweeModal.message', user.primaryEmail(), error.details.otherOfficer),
                className: 'take-over-reviewee-modal',
                buttons: {
                  cancel: {
                    label: i18n('userSummary.takeOverRevieweeModal.cancel'),
                  },
                  approve: {
                    label: i18n('userSummary.takeOverRevieweeModal.confirm'),
                    className: 'btn-danger',
                    callback: () => {
                      // Try reviewing again but with truthy takeOverReviewee flag
                      this.tryReviewingUser(user, true);
                    },
                  },
                },
              });
              break;
            default:
              Session.set('flash', error.message);
              i18nAlert(error, I18N_ERROR_NAMESPACE);
          }
        } else {
          Session.set('flash', '');
          Router.go('reviewUser');
        }
      });
    }
  },

  helpers: {
    containsUser(watchedBy) {
      return _.contains(watchedBy, Meteor.userId());
    },
    progress() {
      return this.getUser().personalInformation.hasBeenReviewed
           ? 'success'
           : 'danger';
    },
    reviewDisabled() {
      return !this.data.isEnableToReview(this.getUser())
        ? 'disabled'
        : '';
    },
    rowClass() {
      if (this.getUser().isUnderReview && this.getUser().isUnderReview()) return 'active';
      if (this.getUser().isApproved && this.getUser().isApproved())    return 'success';
      if (this.getUser().isRejected && this.getUser().isRejected())    return 'danger';
      return '';
    },
  },

  events: {
    'click button.review-btn'() {
      this.tryReviewingUser(this.getUser());
    },
    'click button.unwatch-btn'() {
      const userUnderReview = this.getUser();
      Helpers.confirm({
        message: i18n('userSummary.unwatchUserModal.message', userUnderReview.fullName() ),
        confirm_btn_label: i18n('userSummary.unwatchUserModal.confirm', userUnderReview.fullName()),
        confirm_btn_class: 'btn-danger',
        callback: this.unwatchCallback(userUnderReview),
      });
    },
  },
});
