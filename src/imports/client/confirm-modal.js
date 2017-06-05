const confirmButton = (params) => {
  if (!params) {
    return i18n('modals.buttons.confirm');
  } else {
    return params;
  }
};


export const confirmModal = (message, onConfirm, confirmMessage, onCallback, confirmBtnClass = 'btn-primary') => {
  bootbox.confirm({
    message: message,
    buttons: {
      cancel: {
        label: i18n('modals.buttons.cancel'),
        className: "cancel btn btn-default",
      },
      confirm: {
        label: confirmButton(confirmMessage),
        className: `confirm btn ${confirmBtnClass}`,
      }
    },
    callback: function(isConfirmed) {
      if (isConfirmed) {
        onConfirm();
      }
      if (_.isFunction(onCallback)) {
        onCallback();
      }
    },
    onEscape: function() {}
  });
};

