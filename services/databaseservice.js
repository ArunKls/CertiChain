const bcrypt = require("bcrypt");

const { User } = require("../middleware/databaseconnection.js");

async function signupService(data) {
  let encryptedPassword = bcrypt.hashSync(data.password, 10);

  await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    emailId: data.emailId,
    password: encryptedPassword,
    role: data.role,
    publicKey: data.publicKey,
    privateKey: data.privateKey,
    accountId: data.accountId,
  }).catch((error) => {
    console.log(error);
  });

  // User.create({
  //   firstName: data.firstName,
  //   lastName: data.lastName,
  //   emailId: data.emailId,
  //   password: encryptedPassword,
  //   role: data.role,
  //   publicKey: data.publicKey,
  //   privateKey: data.privateKey,
  //   accountId: data.accountId,
  // })
  //   .then((response) => {
  //     console.log("TEST");
  //     console.log(response);
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });
}

// async function verifyAccount(
//   firstName,
//   publicKey,
//   accountId,
//   privateKey,
//   lastName,
//   emailId,
//   password,
//   role
// ) {
//   let encryptedPassword = crypt(password);

//   const insertStatement =
//     "INSERT INTO CertiChain.user_details (firstName, lastName, emailId, password, role, publicKey, privateKey, accountId) VALUES ? ;";

//   var values = [
//     firstName,
//     lastName,
//     emailId,
//     encryptedPassword,
//     role,
//     publicKey,
//     privateKey,
//     accountId,
//   ];

//   const connectionString = process.env.DATABASE_URL;
//   const pool = new Pool({
//     connectionString,
//   });

//   // Connect to database
//   const client = await pool.connect();

//   await client.query(insertStatement, values, callback);
// }

module.exports = {
  signupService,
};
