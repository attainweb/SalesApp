TemplateController('uploader', {
  state: {
    curUploader: ''
  },
  helpers: {
    curUploader: function() {
      return this.state.curUploader;
    },
    showProgress: function(uploader) {
      return uploader && uploader.status() !== 'done';
    }
  },
  events: {
    'change input[type="file"]'( event, template ) {
      const uploader = Modules.client.uploadToS3( { event: event, template: template, ownerId: template.data.ownerId} );
      this.state.curUploader = uploader;
    }
  }
});
