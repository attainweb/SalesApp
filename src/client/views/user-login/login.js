TemplateController('login', {
  state: {
    forgotPassword: false,
    sent: false,
    btnWaiting: false
  },
  helpers: {
    titleText: function() {
      return this.state.forgotPassword ? 'login.title.forgot' : 'login.title.login';
    },
    passwordResetClass: function() {
      return this.state.forgotPassword ? 'password-reset' : 'login';
    },
    mailTo() {
      return `mailto:${i18n('login.supportEmail')}`;
    }
  },
  events: {
    'click #forgot-password': function() {
      this.state.forgotPassword = true;
    },
    'click #login-link': function() {
      this.state.forgotPassword = false;
    },
    'submit form.login': function(event, template) {
      event.preventDefault();
      template.state.btnWaiting = true;
      const email = template.find('#email').value;
      const password = template.find('#password').value;
      // TODO: Trim and validate fields, show errors
      setTimeout(function() {
        Meteor.loginWithPassword(email, password, function(err) {
          template.state.btnWaiting = false;
          if (err) {
            switch (err.reason) {
              case 'Match failed':
                bootbox.alert(i18n('login.errors.matchFailed'));
                break;
              case 'User not found':
                bootbox.alert(i18n('login.errors.userNotFound'));
                break;
              case 'User has no password set':
                bootbox.alert(i18n('login.errors.noPasswordSet'));
                break;
              case 'Incorrect password':
                bootbox.alert(i18n('login.errors.incorrectPassword'));
                break;
              default:
                bootbox.alert(err);
                break;
            }
          } else {
            Router.go('landing');
          }
        });
      }, 500);
      return false;
    },
    'click #reorder-button': function() {
      Router.go('reorder');
      return false;
    },

    'submit form.password-reset': function(event, template) {
      lang = i18n.getLanguage();
      event.preventDefault();
      template.state.btnWaiting = true;
      const email = template.find('#email').value;
      setTimeout(function() {
        Meteor.call('sendPasswordResetEmail', email, lang, function(err) {
          template.state.btnWaiting = false;
          if (err) {
            bootbox.alert(err.message);
          } else {
            template.state.sent = true;
          }
        });
      }, 500);
    }
  }
});
