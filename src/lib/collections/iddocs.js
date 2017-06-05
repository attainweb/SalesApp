
Iddocs = new Meteor.Collection('iddocs');

Iddocs.helpers({
  update(modifier) {
    modifier.updatedAt = new Date();
    return Meteor.call('updateDoc', this._id, modifier);
  },
  approve() {
    return this.update({ status: 'APPROVED' });
  },
  reject(reason) {
    return this.update({ status: 'REJECTED', statusReason: reason });
  },
  isPending() {
    return this.status === 'PENDING';
  },
  isApproved() {
    return this.status === 'APPROVED';
  },
  isRejected() {
    return this.status === 'REJECTED';
  },
  setPending() {
    return this.update({ status: 'PENDING' });
  },
  owner() {
    return Meteor.users.findOne({ _id: this.userId });
  },
  file() {
    return Docs.findOne(this.fileId);
  },
  filetype() {
    switch (this.mimetype) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/bmp':
      case 'image/gif':
      case 'image/pjpeg':
      case 'image/tiff':
      case 'image/x-tiff':
        return 'IMAGE';

      case 'application/pdf':
      case 'application/msword':
      case 'application/rtf':
      case 'application/x-rtf':
      case 'text/richtext':
        return 'DOC';

      default:
        return 'UNKNOWN';
    }
  },
  doctypeName() {
    return this.doctype.capitalize();
  },
  isDoc: function() {
    return this.filetype() === 'DOC';
  },
});
