const { application } = require("express");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const User = require("../middleware/databaseconnection");
const {
  makeFileObjects,
  storeFile,
  retrieveFileContents,
} = require("../services/web3service");
const {
  createToken,
  sendToken,
  getBalance,
} = require("../services/hederaservice");
const auth = require("../middleware/auth.js");
const { rowService } = require("../services/databaseservice");

const { PrivateKey, PublicKey, AccountId } = require("@hashgraph/sdk");

app.post(
  "/issuecert",
  urlencodedParser,
  auth,
  async function (request, response) {
    let obj = request.user;
    console.log(obj);
    let certData = request.body.certData;
    let receiverId = JSON.parse(certData).studentId;
    console.log(certData);
    console.log("receiver id:" + receiverId);
    fileName = receiverId + "_" + Math.floor(Date.now() / 1000).toString();
    let file = makeFileObjects(certData, fileName);
    let senderObject = await rowService(request.user.user_id);
    let receiverObject = await rowService(receiverId);
    let senderDetails = {
      publicKey: PublicKey.fromString(senderObject.publicKey.toString()),
      privateKey: PrivateKey.fromString(senderObject.privateKey.toString()),
      accountId: AccountId.fromString(senderObject.accountId.toString()),
    };
    let receiverDetails = {
      publicKey: PublicKey.fromString(receiverObject.publicKey.toString()),
      privateKey: PrivateKey.fromString(receiverObject.privateKey.toString()),
      accountId: AccountId.fromString(receiverObject.accountId.toString()),
    };
    //console.log(senderDetails.publicKey);

    storeFile(file).then((cid) => {
      createToken(senderDetails, cid).then((tokenId) => {
        sendToken(senderDetails, senderDetails, receiverDetails, tokenId).then(
          (tokenSent) => {
            console.log("Token Sent");
            // let tokenMemoList = getBalance(receiverDetails, "receiver", true);
            // console.log("TOKEN MEMO LIST", tokenMemoList);
            // retrieveFileContents(tokenMemoList).then((fileContents) => {
            //   console.log(fileContents);
            // });
            responseObject = {
              status: 200,
            };
            response.status(200);
            response.send(responseObject);
          }
        );
      });
    });
  }
);

module.exports = router;
