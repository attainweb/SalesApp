export const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;

export const checkPassword = (password) => {
  return password.match(passwordRegex);

  /*
   (/^
   (?=.*\d)                //should contain at least one digit
   (?=.*[a-z])             //should contain at least one lower case
   (?=.*[A-Z])             //should contain at least one upper case
   [a-zA-Z0-9]{8,}         //should contain at least 8 from the mentioned characters
   $/)
   */
};
