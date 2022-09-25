const { application } = require("express");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const { certService } = require("../services/databaseservice");

app.get("/cert", urlencodedParser, async function (request, response) {
  id = request.body.id;

  certService(id)
    .then((result) => {
      // console.log(result);
      searchResult = result;
      responseObject = {
        searchResult,
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
});

module.exports = router;
