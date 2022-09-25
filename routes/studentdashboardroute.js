const { application } = require("express");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const User = require("../middleware/databaseconnection");
const { retrieveFileContents } = require("../services/web3service");
const { getBalance } = require("../services/hederaservice");
const auth = require("../middleware/auth.js");
const { rowService } = require("../services/databaseservice");

const { PrivateKey, PublicKey, AccountId } = require("@hashgraph/sdk");

app.get(
  "/studentdashboard",
  urlencodedParser,
  auth,
  async function (request, response) {
    let obj = request.user;
    console.log(obj);
    let receiverObject = await rowService(request.user.user_id);
    let receiverDetails = {
      publicKey: PublicKey.fromString(receiverObject.publicKey.toString()),
      privateKey: PrivateKey.fromString(receiverObject.privateKey.toString()),
      accountId: AccountId.fromString(receiverObject.accountId.toString()),
    };

    // let tokenMemoList;
    // console.log("BEFORE FUNCTIOn");
    let tokenMemoList = await getBalance(receiverDetails, "receiver", true);

    let respoObject = [];
    Promise.all(tokenMemoList).then((values) => {
      respoObject = values;
      response.status(200);
      response.send(values);
      // console.log(values);
    });
  }
);

module.exports = router;
