const { application } = require("express");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const { loginService } = require("../services/databaseservice");

app.post("/login", urlencodedParser, async function (request, response) {
  emailId = request.body.emailId;
  password = request.body.password;

  let checkUser = await loginService(emailId, password);
  // Check Database Service
  // if true

  if (checkUser) {
    object = { message: "Logged in Succesfully!", status: 200 };

    response.status(200);
    response.send(object);
  } else {
    object = { message: "Invalid Login Credentials", status: 501 };
    response.status(501);
    response.send(object);
  }
});

module.exports = router;
