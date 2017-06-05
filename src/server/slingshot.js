Slingshot.fileRestrictions( "uploadToS3", {
  allowedFileTypes: [ "image/png", "image/jpeg", "image/gif" ],
  maxSize: Meteor.settings.SLINGSHOT_MAX_FILE_SIZE_MB * 1024 * 1024
});

Slingshot.createDirective( "uploadToS3", Slingshot.S3Storage, {
  bucket: Meteor.settings.SLINGSHOT_S3_BUCKET,
  region: 'ap-northeast-1',
  // acl: "public-read",
  acl: 'private',
  authorize: function() {
    // let userFileCount = Files.find( { "userId": this.userId } ).count();
    // return userFileCount < 3 ? true : false;
    return true;
  },
  key: function( file ) {
    return "files/" + Meteor.uuid() + "_" + file.name;
  }
});
