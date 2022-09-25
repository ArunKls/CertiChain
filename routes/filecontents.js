const { application } = require("express");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const User = require("../middleware/databaseconnection");
const { retrieveFileContents } = require("../services/web3service");

const { PrivateKey, PublicKey, AccountId } = require("@hashgraph/sdk");

app.get(
  "/filecontents",
  urlencodedParser,
  async function (request, response) {
    retrieveFileContents([request.body.cid]).then((fileContents) => {
      let fc = fileContents["files"][0];
      responseObject = {
        fc,
        status: 200,
      };
      response.status(200);
      response.send(responseObject);
    });
  }
);

module.exports = router;
