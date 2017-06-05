export const availableLanguages = Meteor.settings.public.availableLanguages || ['ja'];

export const isAvailableLanguage = (language) => {
  return _.contains(availableLanguages, language);
};
