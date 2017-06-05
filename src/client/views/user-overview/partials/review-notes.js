const isAllowedToAddNote = function(noteType) {
  const canAddNote = 'canAdd' + _.capitalize(noteType) + 's';
  return Meteor.user()[canAddNote]();
};

TemplateController('reviewNotes', {
  props: new SimpleSchema({
    noteType: {
      type: String,
    },
    reviewNotes: {
      type: [Object],
      blackbox: true,
    }
  }),

  state: {
    disableButton: true
  },


  helpers: {
    formatReviewNote: function(reviewNote) {
      if (!reviewNote.comment) reviewNote.comment = i18n('reviewUser.' + this.props.noteType + '.emptyComment');
      return i18n('reviewUser.' + this.props.noteType + '.noteString',
                  reviewNote.name, reviewNote.userId,
                  reviewNote.createdAt.toString(), reviewNote.comment);
    },
    translateText: function(text) {
      return i18n('reviewUser.' + this.props.noteType + "." + text);
    },
    showInputArea: function() {
      return isAllowedToAddNote(this.props.noteType);
    },
    showNotesSection: function() {
      return (this.props.reviewNotes.length > 0 || isAllowedToAddNote(this.props.noteType));
    }
  },

  events: {
    'click .btn': function(event, template) {
      event.preventDefault();
      const textAreaSelector = '#' + this.props.noteType + '-comment';
      let noteComment = template.find(textAreaSelector).value;
      Meteor.call('addUserNote', Meteor.user().currentlyReviewing()._id, this.props.noteType, noteComment);
      template.find(textAreaSelector).value = '';
      this.state.disableButton = true;
      return false;
    },
    'input .form-control': function(event) {
      if (event.target.value !== '') {
        this.state.disableButton = false;
      } else {
        this.state.disableButton = true;
      }
    }
  }
});
