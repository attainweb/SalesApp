// Returns an array of objects used in Quick Form dropdown lists
import * as countryList from '/imports/client/country-list.js';

export const getCountryList = function() {
  let options = [];
  const availableCountries = Meteor.settings.public.availableCountries;
  for (let i = 0; i < availableCountries.length; i++) {
    // Since policies and settings are not defined for every region, we created an array in settings with the countries
    // for whose policies and settings are defined. This could be removed once policies and settings are definitely configured.
    for (let [key, value] of entries(countryList[i18n.getLanguage()])) {
      if (availableCountries[i] === key) {
        options.push({
          'label': value,
          'value': key
        });
      }
    }
  }
  return options;
};

const entries = function* (obj) {
  for (let key of Object.keys(obj)) {
    yield [key, obj[key]];
  }
};

export const getTranslatedCountry = function(countryCode) {
  return countryList[i18n.getLanguage()][countryCode];
};
