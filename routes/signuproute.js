const { application } = require("express");
const express = require("express");
const router = express.Router();
const { createAccount } = require("../services/hederaservice");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const {
  createAccount
} = require("../services/databaseservice");

app.post("/signup", urlencodedParser, function (request, response) {
  //   console.log(request);

  data = request.body;

  console.log(data.firstName);

  // Check if User exists
  //   let userExists = false;

  //   if (userExists) {
  //     responseObject = { message: "User Already Exists", status: 500 };
  //     response.status(500);
  //     response.send(responseObject);
  //   }

  // Call Create Account Service
  if (data.role == 400) {
    createAccount(0)
      .then(async (newAccount) => {
        data.publicKey = newAccount.publicKey;
        data.accountId = newAccount.accountId;
        data.privateKey = newAccount.privateKey;

        // Call Database Service

        await createAccount(data.firstName, data.publicKey, data.accountId, data.privateKey, data.lastName, data.emailId, data.password, data.role);

        responseObject = { message: "SignUp Successful", status: 200 };
        response.status(200);
        response.send(responseObject);
        console.log("From Student", data);
      })
      .catch((error) => {
        responseObject = { message: error, status: 500 };
        response.status(500);
        response.send(responseObject);
      });
  } else {
    createAccount(500)
      .then((newAccount) => {
        data.publicKey = newAccount.publicKey;
        data.accountId = newAccount.accountId;
        data.privateKey = newAccount.privateKey;

        // Call Database Service

        console.log("From Admin", data);

        responseObject = { message: "SignUp Successful", code: 200 };
        response.send(responseObject);
      })
      .catch((error) => {
        responseObject = { message: error, status: 500 };
        response.status(500);
        response.send(responseObject);
      });
  }
});

module.exports = router;
