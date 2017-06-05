import { confirmModal } from '/imports/client/confirm-modal';
import { i18nAlert } from '/imports/client/i18n-alert';
const I18N_ERROR_NAMESPACE = 'reviewUser';

TemplateController('reviewUser', {
  state: {
    rotation: 0,
    selectedDocId: null,
    isDeleting: false,
  },

  'private': {
    complianceActionCallback(action, userUnderReview) {
      return function() {
        if (action === 'finishReviewing') {
          const approvedDocs = userUnderReview.approvedDocs().fetch();
          approvedDocs.forEach(function(doc) {
            doc.setPending();
          });
        }
        Meteor.call(action, userUnderReview._id, function(err) {
          if (err) {
            console.log('err: ', err);
            i18nAlert(err, I18N_ERROR_NAMESPACE);
          }
        });
      };
    },
    selectedDocument(docId) {
      if (docId) {
        return Files.findOne({_id: docId});
      }
      return undefined;
    },
  },

  onCreated() {
    this.autorun( () => {
      if (Meteor.user().currentlyReviewing()) {
        Meteor.subscribe('reviewRecordsByReviweeId', Meteor.user().currentlyReviewing()._id);
        Meteor.subscribe('invoicesByRevieweeId', Meteor.user().currentlyReviewing()._id);
      }
    });
  },

  onRendered() {
    if (Session.equals("ReviewedUser", true)) {
      this.$('#setReviewed').prop('checked', true);
    }
  },

  helpers: {
    getNotesByType(noteType) {
      return _.where(Meteor.user().currentlyReviewing().notes, {"type": noteType });
    },
    showApproveAndReject(delegatedToCco) {
      return (Roles.userIsInRole( Meteor.userId(), 'compliance') && !delegatedToCco)
          || (Roles.userIsInRole( Meteor.userId(), 'chiefcompliance') && delegatedToCco);
    },
    getReviewRecords() {
      return () => ReviewRecords.findByReviweeId(Meteor.user().currentlyReviewing()._id);
    },
    getWatchButton(watchedBy) {
      return _.contains(watchedBy, Meteor.userId())
           ? i18n('reviewUser.buttonUnwatch')
           : i18n('reviewUser.buttonWatch');
    },
    showSendToCco(delegatedToCco) {
      return Roles.userIsInRole( Meteor.userId(), 'compliance') && !delegatedToCco;
    },
    showSendToHco(delegatedToHco) {
      return Roles.userIsInRole( Meteor.userId(), 'customerService') && !delegatedToHco;
    },
    showUnderReviewByCco(delegatedToCco) {
      return Roles.userIsInRole( Meteor.userId(), 'compliance') && delegatedToCco;
    },
    showUnderReviewByHco(delegatedToHco) {
      return Roles.userIsInRole( Meteor.userId(), 'customerService') && delegatedToHco;
    },
    showDoneEditingByHco(delegatedToHco) {
      return Roles.userIsInRole( Meteor.userId(), 'headCompliance') && delegatedToHco;
    },
    checkboxDisabled() {
      return Roles.userIsInRole( Meteor.userId(), 'compliance') ? null : 'disabled';
    },
    rotation() {
      return 'rotate-' + this.state.rotation;
    },
    docContext() {
      let file = this.selectedDocument(this.state.selectedDocId);
      file.imageClasses = 'doc-img wheelzoom';
      return file;
    },
    isSelectedDoc(id) {
      return this.state.selectedDocId === id;
    },
    selectedDoc() {
      this.state.isDeleting = false;
      return this.selectedDocument(this.state.selectedDocId);
    },
    selectedDocClass(id) {
      return (this.state.selectedDocId === id) ? 'active' : '';
    },
    docsInnerHeight() {
      return Meteor.user().currentlyReviewing().docs().count() * 92;
    },
    docFileBorderStyle(canBeDeleted) {
      return canBeDeleted ? 'not-approved' : 'approved';
    },
    formatCall: function(call) {
      if (!call.comment) call.comment = i18n('reviewUser.calls.emptyComment');
      return i18n('reviewUser.calls.callString',
                  call.complianceOfficerName, call.complianceOfficerId,
                  call.createdAt.toString(), call.comment);
    },
    formatWebCheck: function(check) {
      if (!check.comment) check.comment = i18n('reviewUser.webChecks.emptyComment');
      return i18n('reviewUser.webChecks.webCheckString',
                  check.complianceOfficerName, check.complianceOfficerId,
                  check.createdAt.toString(), check.comment);
    },
    formatCustomerServiceNote: function(customerServiceNote) {
      if (!customerServiceNote.comment) customerServiceNote.comment = i18n('reviewUser.customerServiceNotes.emptyComment');
      return i18n('reviewUser.customerServiceNotes.customerServiceNoteString',
        customerServiceNote.name,
        customerServiceNote.userId,
        customerServiceNote.createdAt.toString(),
        customerServiceNote.comment);
    },
    smallDocAttrs(file) {
      file.smallDocClasses = 'small-doc';
      return file;
    },
    getInvoices() {
      return InvoiceTickets.findByUser(Meteor.user().currentlyReviewing()._id);
    },
    selectedFileCanBeDeleted() {
      const docFile = this.selectedDocument(this.state.selectedDocId);
      return !! docFile.canBeDeleted;
    },
    getUsersWithSameBirthdate() {
      const reviewee = Meteor.user().currentlyReviewing();
      return Meteor.users.findBySameBirthdate(reviewee._id, reviewee.personalInformation.birthdate);
    },
    totalSearchResults() {
      const reviewee = Meteor.user().currentlyReviewing();
      return Meteor.users.findBySameBirthdate(reviewee._id, reviewee.personalInformation.birthdate).count();
    }
  },

  events: {
    'click .rotate.btn'() {
      this.state.rotation = (this.state.rotation + 90) % 360;
    },
    'click .doc-image'(event) {
      const eventDocId = this.$(event.currentTarget).data("doc-id");

      if (eventDocId === this.state.selectedDocId) {
        this.state.selectedDocId = undefined;
      } else {
        this.state.selectedDocId = eventDocId;
        Meteor.setTimeout(function() {
          const height = this.$('.doc-image-large img').height();
          const marginTop = (360 - height) / 2;
          this.$('.doc-image-large img').css('margin-top', marginTop + 'px');
          wheelzoom(document.querySelector('.wheelzoom'));
        }, 0);
      }
    },
    'click #save'(event, template) {
      event.preventDefault();
      let comment = template.find('#comment').value;
      Meteor.call('updateUserComment', Meteor.user().currentlyReviewing()._id, comment);
      return false;
    },
    'click .approve-user'() {
      const userUnderReview = Meteor.user().currentlyReviewing();
      Helpers.confirm({
        message: i18n('compliance.approveUserModal.message'),
        confirm_btn_label: i18n('compliance.approveUserModal.confirm'),
        confirm_btn_class: 'btn-primary',
        cancel_btn_label: i18n('compliance.approveUserModal.cancel'),
        callback: this.complianceActionCallback('approveUser', userUnderReview),
      });
    },
    'click .toggle-watch'() {
      const userUnderReview = Meteor.user().currentlyReviewing();
      let methodToCall = "watchUser";
      if (_.contains(userUnderReview.personalInformation.watchedBy, Meteor.userId())) {
        methodToCall = "unwatchUser";
      }
      Meteor.call(methodToCall, userUnderReview._id, function(err) {
        if (err) {
          console.log('err: ', err);
          i18nAlert(err, I18N_ERROR_NAMESPACE);
        }
      });
    },
    'click .send-to-cco'() {
      const userUnderReview = Meteor.user().currentlyReviewing();
      Helpers.confirm({
        message: i18n('compliance.sendUserToCcoModal.message'),
        confirm_btn_label: i18n('compliance.sendUserToCcoModal.confirm'),
        confirm_btn_class: 'btn-info',
        cancel_btn_label: i18n('compliance.sendUserToCcoModal.cancel'),
        callback: this.complianceActionCallback('sendUserToCco', userUnderReview),
      });
    },
    'click .send-to-hco'() {
      const userUnderReview = Meteor.user().currentlyReviewing();
      Helpers.confirm({
        message: i18n('compliance.sendUserToHcoModal.message'),
        confirm_btn_label: i18n('compliance.sendUserToHcoModal.confirm'),
        confirm_btn_class: 'btn-info',
        cancel_btn_label: i18n('compliance.sendUserToHcoModal.cancel'),
        callback: this.complianceActionCallback('sendUserToHco', userUnderReview),
      });
    },
    'click .done_hco'() {
      const userUnderReview = Meteor.user().currentlyReviewing();
      Helpers.confirm({
        message: i18n('compliance.doneEditingModal.message'),
        confirm_btn_label: i18n('compliance.doneEditingModal.confirm'),
        confirm_btn_class: 'btn-info',
        cancel_btn_label: i18n('compliance.doneEditingModal.cancel'),
        callback: this.complianceActionCallback('doneEditingHco', userUnderReview),
      });
    },
    'click .reject-user'() {
      const userUnderReview = Meteor.user().currentlyReviewing();
      Helpers.confirm({
        message: i18n('compliance.rejectUserModal.message'),
        confirm_btn_label: i18n('compliance.rejectUserModal.confirm'),
        confirm_btn_class: 'btn-danger',
        cancel_btn_label: i18n('compliance.rejectUserModal.cancel'),
        callback: this.complianceActionCallback('rejectUser', userUnderReview),
      });
    },
    'click .cancel-user'() {
      const userUnderReview = Meteor.user().currentlyReviewing();
      Helpers.confirm({
        message: i18n('compliance.cancelUserModal.message'),
        confirm_btn_label: i18n('compliance.cancelUserModal.confirm'),
        confirm_btn_class: 'btn-primary',
        cancel_btn_label: i18n('compliance.cancelUserModal.cancel'),
        callback: this.complianceActionCallback('finishReviewing', userUnderReview),
      });
    },
    'click #setReviewed'() {
      const user = Meteor.user().currentlyReviewing();
      Session.set("ReviewedUser", !user.personalInformation.hasBeenReviewed);
      Meteor.call('updateHasBeenReviewed', user._id, function(err) {
        if (err) {
          i18nAlert(err, I18N_ERROR_NAMESPACE);
        }
      });
    },
    'click .delete.btn'() {
      const fileId = this.state.selectedDocId;
      confirmModal(
        i18n('modals.deleteDocFile.confirmMessage'),
        () => {
          this.state.isDeleting = true;
          Meteor.call('deleteDocFile', fileId, (error) => {
            if (error) {
              i18nAlert(error, I18N_ERROR_NAMESPACE);
            }
            // This allows to upload a document with the same name that the one which was uploaded previously if there has been a deletion,
            // since upload is triggered on a change event.
            // It solves the case where CO accidentally deleted the image he just uploaded.
            $("input[id=file-upload]").val("");
          });
        },
        i18n('modals.deleteDocFile.confirmButton'),
      );
    },
  }
});
