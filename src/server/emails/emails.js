import { availableLanguages } from '/imports/lib/shared/i18n';
import _ from 'lodash';

const commonTemplatesKeys = [
  'footer'
];

const emailTemplateKeys = [
  'et205-confirm-funds-received',
  'eu202-distributor-approval',
  'eu301-distributor-signup',
  'et202-invoice-bank',
  'et203-invoice-btc',
  'et204-invoice-expired-email',
  'et206-invoice-canceled-email',
  'et201-product-reserved-but-pending',
  'eu101-password-reset',
  'et301-receipt',
  'et102-waiting-for-sale-to-start',
  'eu302-wallet-address-changed-confirmation',
  'eu303-wallet-address-changed',
  'eu304-email-change-new-email-confirmation',
  'eu305-email-change-current-email-confirmation',
  'eu306-email-changed',
  'eu201-buyer-approval',
  'et101-ticket-enqueued-email',
  'eu102-waiting-for-product-while-pending-compliance',
  'eu501-re-generate-all-product-passcodes',
  'eu502-re-generate-product-passcode',
  'eu103-verification-code'
];

const LANGUAGE_KEY = "_LANG_";

_.each(availableLanguages, function(lang) {
  // First add common templates as those are referenced by the followers
  _.each(commonTemplatesKeys, function(key) {
    SSR.compileTemplate(`${key}${lang}`, Assets.getText(`emails/${lang}/${key}.html`));
  });
  _.each(emailTemplateKeys, function(key) {
    const fullKey = `emails/${lang}/${key}`;
    const templateText = _.replace(Assets.getText(`${fullKey}.html`), LANGUAGE_KEY, lang);
    SSR.compileTemplate(fullKey, templateText);
  });
});
