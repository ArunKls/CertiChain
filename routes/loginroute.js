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

  console.log("CHECK USER", checkUser);

  if (checkUser.status === 200) {
    object = checkUser; //

    response.status(200);
    response.send(object);
  } else {
    object = { message: "Invalid Login Credentials", status: 501 };
    response.status(501);
    response.send(object);
  }
});

module.exports = router;
