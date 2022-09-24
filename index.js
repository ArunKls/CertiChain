express = require("express");
app = express();
var bodyParser = require("body-parser");

const signuproute = require("./routes/signuproute");
app.use(signuproute);

const loginroute = require("./routes/loginroute");
app.use(loginroute);

const searchroute = require("./routes/searchroute");
app.use(searchroute);

const testroute = require("./routes/testroute.js");
app.use(testroute);

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.listen(8001, "0.0.0.0", function () {
  console.log("SERVER IS RUNNING");
});
