const bcrypt = require("bcrypt");
const { response } = require("express");

const { User } = require("../middleware/databaseconnection.js");
const Sequelize = require("sequelize");
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

async function loginService(emailId, password) {
    let user = await User.findOne({
        where: {
            emailId: emailId
        }
    });
    if (!user) return false;
    
    bcrypt.compare(password, user.password, function(err, res) {
      if (err){
        console.log(err);
      }
      if (res) {
        return true;
      } else {
        // response is OutgoingMessage object that server response http request
        return false;
      }
    });
}

async function searchService(query) {
    let sequelize = new Sequelize(process.env.DATABASE_URL);
    let result = await User.findAll({
        where: {
          [User.fn('concat', User.col('firstName'), ' ', User.col('lastName')), {
            like: '%' + query + '%'
          
        }]},})
});
return result;
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
  signupService, loginService, searchService,
};
