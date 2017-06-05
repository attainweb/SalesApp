import Logger from '/imports/server/lib/logger';

let lang = 'ja';
i18n.setLanguage(lang);
moment.locale(lang);
Logger.info(lang);
