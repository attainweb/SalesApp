const randomGenerator = function randomGenerator() {
  return Random.hexString(32);
};

let generator = randomGenerator;

export const generateProductPasscode = function() {
  return generator();
};

export const configure = function(aGenerator) {
  generator = aGenerator;
};
