const { application } = require("express");
const express = require("express");
const router = express.Router();

const mainService = require("../services/mainservice.js");
app.get("/testhedera", function (request, response) {
  const resp = mainService.mainService();

  response.send(resp);
});

module.exports = router;
