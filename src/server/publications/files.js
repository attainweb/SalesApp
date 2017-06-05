import Logger from '/imports/server/lib/logger';

// publishComposite is needed here otherwise the transformation on the collection is not run!
Meteor.publishComposite( 'enrollFiles', function() {
  Logger.info('Meteor.publish', 'enrollFiles', this.connection.id);
  return {
    find: function() {
      return Files.find( { "connectionId": this.connection.id } );
    },
  };
});
