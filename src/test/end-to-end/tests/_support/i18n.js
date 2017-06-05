/**
 * Wrapper around the i18n api on our server, so that we can use
 * it in a very similar way for the acceptance tests. Please be aware that
 * due to limitations in the chimp code this only supports up to 3 i18n params.
 * It uses the cient defined lang in order to get the translations
 * Example:
 * i18n('enroll.emailVerificationCodeSent', email, anotherParam);
 */

export const i18nTest = function() {
  const clientLang = client.execute(() => {
    return i18n.getLanguage();
  });
  return server.execute((lang, path, p1, p2, p3) => {
    const prevLang = i18n.getLanguage();
    i18n.setLanguage(lang);
    const translated = i18n(path, p1, p2, p3);
    i18n.setLanguage(prevLang);
    return translated;
  }, clientLang.value, ...arguments);
};
