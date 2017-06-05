TemplateController('reviewRecords', {

  onCreated() {
    this.autorun(() => {
      this.records = this.data.records();
    });
  },
  helpers: {
    reviewRecordReviewerFullname(reviewRecord) {
      return reviewRecord.complianceAdmin().fullName();
    },

    reviewRecordReviewerEmail(reviewRecord) {
      return reviewRecord.complianceAdmin().primaryEmail();
    },

    getTranslatedStatus(reviewRecord) {
      return i18n(`compliance.statusTypes.${reviewRecord.status}`);
    },

    hasReviewRecords() {
      return this.records.count() > 0;
    }
  }
});
