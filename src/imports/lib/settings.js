'use strict';

export const enrollmentSettingsForCountry = function(residenceCountry) {
  if (!residenceCountry) throw new Meteor.Error(500, 'Residence Country is undefined');
  const enrollmentRegion = Meteor.settings.public.regionalMappings[residenceCountry];
  if (enrollmentRegion) {
    return Meteor.settings.public.regionalSettings[enrollmentRegion].enrollment;
  } else {
    return undefined;
  }
};

export const getSupportEmailByLanguage = function getSupportEmailByLanguage(languageCode) {
  let support = Meteor.settings.public.support[languageCode];
  if (!support) {
    support =  Meteor.settings.public.support.default;
  }
  return support.email;
};

export const getCompanyInfoByLanguage = function(language) {
  if (!language) throw new Meteor.Error(500, 'language is undefined');
  return Meteor.settings.public.companyInformation[language];
};

export const getProductNameByLanguage = function(languageCode) {
  if (!languageCode) throw new Meteor.Error(500, 'Language is undefined');
  return Meteor.settings.public.productName[languageCode];
};
