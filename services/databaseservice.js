const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

var accountValues = Array(3);

// Wrapper for a transaction.  This automatically re-calls the operation with
// the client as an argument as long as the database server asks for
// the transaction to be retried.
async function retryTxn(n, max, client, operation, callback) {
  const backoffInterval = 100; // millis
  const maxTries = 5;
  let tries = 0;

  while (true) {
    await client.query('BEGIN;');

    tries++;

    try {
      const result = await operation(client, callback);
      await client.query('COMMIT;');
      return result;
    } catch (err) {
      await client.query('ROLLBACK;');

      if (err.code !== '40001' || tries == maxTries) {
        throw err;
      } else {
        console.log('Transaction failed. Retrying.');
        console.log(err.message);
        await new Promise(r => setTimeout(r, tries * backoffInterval));
      }
    }
  }
}

async function createAccount(firstName, publicKey, accountId, privateKey, lastName, emailId, password, role) {

  let encryptedPassword = crypt(password);

  const insertStatement =
    "INSERT INTO CertiChain.user_details (firstName, lastName, emailId, password, role, publicKey, privateKey, accountId) VALUES ? ;"
  
  var values = [firstName, lastName, emailId, encryptedPassword, role, publicKey, privateKey, accountId];

  await client.query(insertStatement, values, callback);

}

async function verifyAccount(firstName, publicKey, accountId, privateKey, lastName, emailId, password, role) {

  let encryptedPassword = crypt(password);

  const insertStatement =
    "INSERT INTO CertiChain.user_details (firstName, lastName, emailId, password, role, publicKey, privateKey, accountId) VALUES ? ;"
  
  var values = [firstName, lastName, emailId, encryptedPassword, role, publicKey, privateKey, accountId];

  await client.query(insertStatement, values, callback);

}

var crypt = {
  // (B1) THE SECRET KEY
  secret : "CIPHERKEY",
 
  // (B2) ENCRYPT
  encrypt : (password) => {
    var cipher = CryptoJS.AES.encrypt(password, crypt.secret);
    cipher = cipher.toString();
    return cipher;
  },
 
  //(B3) DECRYPT
  decrypt : (password) => {
    var decipher = CryptoJS.AES.decrypt(password, crypt.secret);
    decipher = decipher.toString(CryptoJS.enc.Utf8);
    return decipher;
  }
};

module.exports = {
  createAccount,
};

