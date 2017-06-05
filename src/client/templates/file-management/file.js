TemplateController('file', {
  helpers: {
    isImage(url) {
      if (!url) return false;
      const formats = ['jpg', 'jpeg', 'png', 'gif'];
      return _.find(formats, (format) => url.toLowerCase().indexOf(format) > -1);
    }
  }
});
