Helpers = {};

Helpers.confirm = function confirm(options) {
  bootbox.dialog({
    message: options.message,
    buttons: {
      cancel: {
        label: options.cancel_btn_label || 'Cancel',
      },
      approve: {
        label: options.confirm_btn_label,
        className: options.confirm_btn_class,
        callback: options.callback,
      },
    },
  });
};

Helpers.FORMAT_DATE_UNIVERSAL = 'YYYY-MM-DD';
Helpers.FORMAT_DATETIME_UNIVERSAL = 'YYYY-MM-DD hh:mm:ss';

Helpers.formatDate = function formatDate(date) {
  return date ? moment(date).format(Helpers.FORMAT_DATE_UNIVERSAL) : '-';
};

Helpers.formatDateTime = function formatDateTime(date) {
  return date ? moment(date).format(Helpers.FORMAT_DATETIME_UNIVERSAL) : '-';
};

Helpers.formatCurrency = function formatCurrency(currency, amount) {
  currencyFormatMap = {
    'USD': {symbol: '$', format: '0,0[.]00'},
    'YEN': {symbol: '¥', format: '0,0'},
    'BTC': {symbol: '฿', format: '0,0[.]00000000'},
  };
  const currencyFormat = currencyFormatMap[currency];
  if (currencyFormat) {
    return currencyFormat.symbol + numeral(amount || 0).format(currencyFormat.format);
  } else {
    console.log('[formatCurrency] No mapping for currency:', currency);
    return '-';
  }
};

Template.registerHelper('formatDate', Helpers.formatDate);

Template.registerHelper('formatDateTime', Helpers.formatDateTime);

Template.registerHelper('formatCurrency', Helpers.formatCurrency);

Template.registerHelper('termsOfConductUrl', function termsOfConductUrl(paramsObj) {
  const params = (paramsObj && paramsObj.hash) || {};
  let role = params.role;
  let distlevel = params.distlevel;
  if (role === undefined || (role === 'distributor' && distlevel === undefined)) {
    const currentUser = Meteor.user();
    role = role || currentUser.primaryRole();
    distlevel = distlevel || currentUser.personalInformation.distlevel;
  }
  const docs = {
    0: 'dummy.pdf',          // Partner
    1: 'dummy.pdf', // Tier 1
    2: 'dummy.pdf',  // Tier 2
    3: 'dummy.pdf',   // Tier 3
  };

  const roleDistlevelPolicyMap = {
    distributor: docs,
    partner: docs,
    buyer: {
      null: 'dummy.pdf',
      undefined: 'dummy.pdf',
    },
  };
  const slug = roleDistlevelPolicyMap[role][distlevel];
  return Meteor.absoluteUrl(slug);
});

Template.registerHelper('count', _.size);

Template.registerHelper('and', function and(x, y) {
  return !!(x && y);
});

Template.registerHelper('or', function or(x, y) {
  return !!(x || y);
});

Template.registerHelper('satoshisToBtc', function or(satoshis) {
  return (satoshis / 100000000);
});
