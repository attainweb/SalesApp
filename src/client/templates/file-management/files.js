TemplateController('files', {
  helpers: {
    files() {
      const files = Files.find( {}, { sort: { "uploadedAt": -1 } } );
      if ( files ) {
        return files;
      }
      return [];
    }
  },
  onCreated() {
    Template.instance().subscribe('enrollFiles');
  }
});
