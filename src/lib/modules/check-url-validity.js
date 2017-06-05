let _fileExistsInDatabase = ( url ) => {
  return Files.findOne( { "url": url, "userId": Meteor.userId() }, { fields: { "_id": 1 } } );
};

let _isNotAmazonUrl = ( url ) => {
  return ( url.indexOf( 'amazonaws.com' ) < 0 );
};

let _validateUrl = ( url ) => {
  if ( _fileExistsInDatabase( url ) ) {
    return { valid: false, error: "fileExists", url: url };
  }

  if ( _isNotAmazonUrl( url ) ) {
    return { valid: false, error: "invalidUrl", url: url };
  }

  return { valid: true };
};

let validate = ( url ) => {
  let test = _validateUrl( url );

  if ( !test.valid ) {
    throw new Meteor.Error( test.error, test.url );
  }
};

Modules.both.checkUrlValidity = validate;
