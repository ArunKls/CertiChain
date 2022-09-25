const { application } = require("express");
const express = require("express");
const router = express.Router();
const { createAccount } = require("../services/hederaservice");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const { signupService, addAcademicData } = require("../services/databaseservice");

app.post("/signup", urlencodedParser, function (request, response) {
  data = request.body;

  // Call Create Account Service
  if (data.role == 400) {
    createAccount(0)
      .then(async (newAccount) => {
        data.publicKey = newAccount.publicKey;
        data.accountId = newAccount.accountId;
        data.privateKey = newAccount.privateKey;

        let res = await signupService(data);

        response.send(res);
      })
      .catch((error) => {
        responseObject = { message: error, status: 500 };
        response.status(500);
        response.send(responseObject);
      });
  } else {
    createAccount(500)
      .then(async (newAccount) => {
        data.publicKey = newAccount.publicKey;
        data.accountId = newAccount.accountId;
        data.privateKey = newAccount.privateKey;

        let res = await signupService(data);

        let res2 = await addAcademicData({
          studentId: res.id,
          degree: "Masters",
          schoolName: "Rutgers",
          division: "A",
          year: 2022,
        });
        response.send(res);
      })
      .catch((error) => {
        responseObject = { message: error, status: 500 };
        response.status(500);
        response.send(responseObject);
      });
  }
});

module.exports = router;
