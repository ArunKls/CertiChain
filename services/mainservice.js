const {
  makeFileObjects,
  retrieveFileContents,
  storeFile,
} = require("./web3service.js");

const {
  createAccount,
  sendCertificate,
  createToken,
  sendToken,
  getBalance,
} = require("./hederaservice.js");

function mainService() {
  createAccount(20).then((senderDetails) => {
    createAccount(10).then((receiverDetails) => {
      let file = makeFileObjects();
      console.log("FILE", file);
      storeFile(file).then((cid) => {
        console.log(cid);
        createToken(senderDetails, cid).then((tokenId) => {
          sendToken(
            senderDetails,
            senderDetails,
            receiverDetails,
            tokenId
          ).then((tokenSent) => {
            getBalance(receiverDetails, "receiver", true).then(
              (tokenMemoList) => {
                retrieveFileContents(tokenMemoList).then((fileContents) => {
                  console.log(fileContents);
                });
              }
            );
          });
        });
      });
    });
  });
}

module.exports = { mainService };
