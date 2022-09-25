express = require("express");
app = express();
var bodyParser = require("body-parser");

const cors = require("cors");
app.use(cors());

const signuproute = require("./routes/signuproute");
app.use(signuproute);

const loginroute = require("./routes/loginroute");
app.use(loginroute);

const searchroute = require("./routes/searchroute");
app.use(searchroute);

const testroute = require("./routes/testroute.js");
app.use(testroute);

const certroute = require("./routes/certroute.js");
app.use(certroute);

const issuecertificateroute = require("./routes/issuecertificateroute.js");
app.use(issuecertificateroute);

const studentdashboard = require("./routes/studentdashboardroute.js");
app.use(studentdashboard);

const filecontents = require("./routes/filecontents.js");
app.use(filecontents);

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8001;

app.listen(PORT, function () {
  console.log(`server started on port ${PORT}`);
});
