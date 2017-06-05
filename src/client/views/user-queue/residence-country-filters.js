import { getTranslatedCountry } from '/imports/client/countries';

TemplateController('residenceCountryFilters', {
  helpers: {
    others() {
      return i18n("residenceCountryFilters.others");
    },
    countryFilters() {
      const countriesArray = Object.keys(this.data.selection);
      countriesArray.splice(countriesArray.indexOf("others"), 1);
      return countriesArray;
    },
    translateCountry(countryCode) {
      return getTranslatedCountry(countryCode);
    }
  }
});
