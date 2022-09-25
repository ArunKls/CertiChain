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
  "/issuecert",
  urlencodedParser,
  auth,
  async function (request, response) {
    let obj = request.user;
    let receiverId = request.body.studentId;
    let certData = request.body.certData;
    let file = makeFileObjects(certData);
    storeFile(file).then((cid) => {
      createToken(senderDetails, cid).then((tokenId) => {
        sendToken(senderDetails, senderDetails, receiverDetails, tokenId).then(
          (tokenSent) => {
            console.log("Token Sent");
          }
        );
      });
    });
  }
);

module.exports = router;
