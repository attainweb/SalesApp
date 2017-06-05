import Logger from '/imports/server/lib/logger';

if (Meteor.settings.AWSAccessKeyId && Meteor.settings.AWSSecretAccessKey) {
  Logger.info("AWS starting");

  AWS.config.update({
    accessKeyId: Meteor.settings.AWSAccessKeyId,
    secretAccessKey: Meteor.settings.AWSSecretAccessKey,
    region: Meteor.settings.SLINGSHOT_S3_REGION,
    Bucket: Meteor.settings.SLINGSHOT_S3_BUCKET
  });

}

// s3.copyObjectSync(_.extend({CopySource: Meteor.settings.SLINGSHOT_S3_BUCKET + '/docs/YAuCSP2icY544JhjK-Screen Shot 2016-02-28 at 01.56.05.png', Key: 'xxx/test1.png'}, params) );
// s3.copyObjectSync(_.extend({CopySource: Meteor.settings.SLINGSHOT_S3_BUCKET + '/sample-button-background.png', Key: '/xxx/test2.png'}, params) );
