export const  i18nAlert = (err, i18nNamespace, params) => {
  let errorMessage = "";
  if (params) {
    errorMessage =  i18n(i18nNamespace + `.errors.${err.error}`, params);
  } else {
    errorMessage =  i18n(i18nNamespace + `.errors.${err.error}`);
  }
  bootbox.alert(errorMessage);
};
