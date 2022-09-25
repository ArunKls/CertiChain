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
  
  file = makeFileObjects(certData);
  cid = storeFile(file)
  .then((result) => {
    responseObject = {
      status: 200,
    };


    response.status(200);
    response.send(responseObject);
  })
  .catch((error) => {
    responseObject = { message: error, status: 500 };
    response.status(500);
    response.send(responseObject);
  });
  
);

module.exports = router;
