const { application } = require("express");
const express = require("express");
const router = express.Router();
const { createAccount } = require("../services/hederaservice");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const { signupService } = require("../services/databaseservice");

app.post("/signup", urlencodedParser, function (request, response) {
  //   console.log(request);

  data = request.body;

  console.log(data.firstName);

  // Call Create Account Service
  if (data.role == 400) {
    createAccount(0)
      .then(async (newAccount) => {
        data.publicKey = newAccount.publicKey;
        data.accountId = newAccount.accountId;
        data.privateKey = newAccount.privateKey;

        // Call Database Service

        signupService(data);

        responseObject = { message: "SignUp Successful", status: 200 };
        response.status(200);
        response.send(responseObject);
      })
      .catch((error) => {
        console.log("FROM ERROR");
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

        signupService(data);

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
