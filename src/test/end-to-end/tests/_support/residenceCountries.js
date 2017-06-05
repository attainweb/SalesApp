
export const residenceCountries = {
  Japan: 'JP',
  Korea: 'KR',
  China: 'CN'
};

export const getTranslatedCountry = function(country) {
  const countryHelper = require('/imports/client/countries');
  return countryHelper.getTranslatedCountry(country);
};
