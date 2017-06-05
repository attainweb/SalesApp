import { availableLanguages } from '/imports/lib/shared/i18n';

const languageOptions = _.map(availableLanguages, function(lang) {
  return {
    label: function() {
      return NoI18nMessages.languages[lang];
    },
    value: lang
  };
});

TemplateController('languageSelector', {
  props: new SimpleSchema({
    'class': {
      type: String,
    },
  }),

  onCreated() {
  },

  helpers: {
    getLanguages() {
      return languageOptions;
    },
    isSelected(value) {
      return i18n.getLanguage() === value;
    },
    getSelected() {
      return i18n.getLanguage();
    }
  },

  events: {
    'change select[name="language"]': function(e) {
      const lang = $(e.target).val();
      if (lang !== i18n.getLanguage()) {
        i18n.setLanguage(lang);
      }
    }
  }
});
