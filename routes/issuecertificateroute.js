const { application } = require("express");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const { makeFileObjects, storeFile } = require("../services/web3service");
const auth = require("../middleware/auth.js");

app.post(
  "/issueCert",
  urlencodedParser,
  auth,
  async function (request, response) {
    console.log(request.user);
  }
);

module.exports = router;
