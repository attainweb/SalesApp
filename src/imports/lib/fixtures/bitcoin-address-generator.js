'use strict';

import faker from "faker";

/* Obs: faker.finance.bitcoinAddress() don't generate valid btcAddress for
   BitcoinAddress.validate() pluggin method.
*/

const telnetBitcoinAddressDataset1 = [
  "mss5NFyX96ix4erFMamR1gK3SsvUSMWcjE",
  "3E5sH77vAgw3gQq4zpuZ8XyXrjVbTcEYRG",
  "mswjs2qUXcBW9scDJBdiHBUDw2JY4Rz9aY",
  "2N56jNwSD25v3xK2DFguLFL5sjZq6ffHFxr",
  "mvVeZ9nqKcs7BqYJzAW877sd3658HYGABF",
];

const telnetBitcoinAddressDataset2 = [
  "n15yHKEhbLHmpsD3kdgoKSSErZjcH6PgTe",
  "mzXCBFydNjgbmHvPk3JgWD9BAx1Ew7eQzxV",
  "miLid5bB12v91zwzBUWm5VkYMrV1bNfCgk",
  "mwDytVD7Pst28gWWXZSGa6wv2G4EHzydDh",
  "2Mx3TZycg4XL5sQFfERBgNmg9Ma7uxowK9y"
];

/* If it's used more than one time on the same "file", pls
   validate that the other address that the method generates is different */
export const generateBitcoinAddress = (bitcoinAddress) =>
     faker.random.arrayElement(bitcoinAddress);

export const generateTelnetBitcoinAddressWithDataset1 = () =>
     generateBitcoinAddress(telnetBitcoinAddressDataset1);

export const generateTelnetBitcoinAddressWithDataset2 = () =>
     generateBitcoinAddress(telnetBitcoinAddressDataset2);
