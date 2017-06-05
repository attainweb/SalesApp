import { isAvailableLanguage } from '/imports/lib/shared/i18n';

// set language based on browser settings
let userLang = navigator.language || navigator.userLanguage || 'ja';
userLang = userLang.split('-')[0];
if (!isAvailableLanguage(userLang)) userLang = 'ja';


RankedUsers = new Meteor.Collection(null);

const convertToTAPi18nLang = function(lang) {
  switch (lang) {
    case 'ja':
      return 'jp';
    case 'zh':
      return 'zh-CN';
    case 'ko':
      return 'ko';
    default:
      return 'en';
  }
};

const syncI18nAndTAPi18n = function() {
  const originalSetLanguage = i18n.setLanguage;// .bind(i18n);
  i18n.setLanguage = function(lang) {
    originalSetLanguage(lang);
    TAPi18n.setLanguage(convertToTAPi18nLang(lang));
  };
};

syncI18nAndTAPi18n();


i18n.setLanguage(userLang);
moment.locale(userLang);

Meteor.startup(function() {
  Deps.autorun(function() {
    if (Meteor.user()) {
      let lang = Meteor.user().lang();
      console.log("We got a user, so set his saved language", Meteor.userId(), lang);
      i18n.setLanguage(lang);
      moment.locale(lang);
    }
  });

  // override the logout function to make the Meteor.call and notify the server
  const _logout = Meteor.logout;
  Meteor.logout = function customLogout() {
    console.log('on logout');
    Meteor.call('onClientLogoutStart');
    const args = Array.from(arguments);
    const userId = Meteor.userId();
    // Add the callback to complete the logout event
    args.push(function() {
      Meteor.call('onClientLogoutComplete', userId);
      // Clear the session after logout to delete any info on it
      Session.clear();
    });
    _logout.apply(Meteor, args);
  };
});

