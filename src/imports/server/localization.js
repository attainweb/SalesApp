import { getSupportEmailByLanguage, getCompanyInfoByLanguage, getProductNameByLanguage } from '/imports/lib/settings';

export const renderLocalizedEmail = function(template, language, options) {
  options.supportEmail = getSupportEmailByLanguage(language);
  const companyInfo = getCompanyInfoByLanguage(language);
  options.companyName = companyInfo.name;
  options.address = companyInfo.address;
  options.urls = companyInfo.urls;
  options.socialAccounts = companyInfo.socialAccounts;
  options.bankAccount1 = companyInfo.bankAccounts[0];
  options.bankAccount2 = companyInfo.bankAccounts[1];
  options.productName = getProductNameByLanguage(language);
  return SSR.render(`emails/${language}/${template}`, options);
};
