express = require("express");
app = express();

const testroute = require("./routes/testroute.js");
app.use(testroute);

app.listen(8001, "0.0.0.0", function () {
  console.log("SERVER IS RUNNING");
});
