const { application } = require("express");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post("/login", urlencodedParser, function (request, response) {
  emailId = request.body.emailId;
  password = request.body.password;

  let checkUser = true;

  // Check Database Service
  // if true

  if (checkUser) {
    object = {};

    response.status(200);
    response.send(object);
  } else {
    object = { message: "Invalid Login Credentials", status: 501 };
    response.status(501);
    response.send(response);
  }
});

module.exports = router;
