const { application } = require("express");
const express = require("express");
const router = express.Router();

const service = require("../services/hederaservice");
app.get("/testhedera", function (request, response) {
  const resp = service.hederaTransaction();

  response.send(resp);
});

module.exports = router;
