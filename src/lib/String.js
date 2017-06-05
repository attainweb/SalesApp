String.prototype.firstChar = function() {
  return this.substring(0, 1);
};

String.prototype.setCharAt = function(index, newValue) {
  return this.substring(0, index) + newValue + this.substring(index + 1, this.length);
};

String.prototype.capitalize = function() {
  return this.setCharAt(0, this.charAt(0).toUpperCase());
};
