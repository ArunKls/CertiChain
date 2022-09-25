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

app.post(
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
    let tokenMemoList = await getBalance(receiverDetails, "receiver", true);
    console.log("TOKEN MEMO LIST", tokenMemoList);
    // retrieveFileContents(tokenMemoList).then((fileContents) => {
    //   console.log(fileContents);
    responseObject = {
      Certificates: await tokenMemoList,
      status: 200,
    };
    response.status(200);
    response.send(responseObject);
  }
);

module.exports = router;
