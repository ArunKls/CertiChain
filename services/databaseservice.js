const bcrypt = require("bcrypt");

const { User } = require("../middleware/databaseconnection.js");
const jwt = require("jsonwebtoken");

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

module.exports = {
  signupService,
};
