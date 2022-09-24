const bcrypt = require("bcrypt");
const { response } = require("express");

const { User } = require("../middleware/databaseconnection.js");
const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");
async function signupService(data) {
  let encryptedPassword = bcrypt.hashSync(data.password, 10);

  let response;

  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    emailId: data.emailId,
    password: encryptedPassword,
    role: data.role,
    publicKey: data.publicKey,
    privateKey: data.privateKey,
    accountId: data.accountId,
  })
    .then(function (item) {
      const token = jwt.sign(
        { user_id: item.id, email: item.emailId },
        process.env.JWT_TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      item.update({
        token: token,
      });

      // item.token = token;
      response = {
        message: "Item Created",
        status: 200,
        token: token,
      };
    })
    .catch((error) => {
      console.log("FROM ERROR");
      console.log(error);

      response = { message: error, status: 501 };
    });

  // console.log(await response);
  return await response;
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
    let result = await User.findAll({
      where: {
        [Op.like]: [{emailId: '%'+query+'%'}]
    }
});
console.log(result);
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
