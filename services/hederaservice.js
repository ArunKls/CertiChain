require("dotenv").config();
const {
  AccountId,
  PrivateKey,
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  AccountBalanceQuery,
  TokenAssociateTransaction,
  AccountCreateTransaction,
  Hbar,
  //   TokenNftInfoQuery,
  TokenInfoQuery,
} = require("@hashgraph/sdk");

require("dotenv").config();
// import { create } from "ipfs-http-client";
const { Web3Storage } = require("web3.storage");
const { Blob } = require("buffer");
// const { File } = require();
const fs = require("fs");

function getAccessToken() {
  return process.env.WEB3STORAGE_TOKEN;
}
function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

function makeFileObjects() {
  const obj = { "Certificate Name": "test" };
  // const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });

  fs.writeFileSync("certificate.json", JSON.stringify(obj));

  console.log("FILE CREATED");

  // const file = new File([blob], "hello.json");

  // return file;
}

async function storeFiles() {
  const client = makeStorageClient();
  // let file = fs.readFileSync("certificate.json");
  const pathFiles = await getFilesFromPath("certificate.json");

  console.log("FILE CONTENTS", pathFiles);
  console.log("FILE CONTENTS", ...pathFiles);
  const cid = await client.put(...pathFiles);
  console.log("stored files with cid:", cid);
  return cid;
}

async function createAccount(amount) {
  const myAccountId = process.env.MY_ACCOUNT_ID;
  const myPrivateKey = process.env.MY_PRIVATE_KEY;

  if (myAccountId == null || myPrivateKey == null) {
    throw new Error(
      "Environment variables myAccountId and myPrivateKey must be present"
    );
  }

  const client = Client.forTestnet();

  client.setOperator(myAccountId, myPrivateKey);

  const newAccountPrivateKey = await PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.from(amount))
    .execute(client);

  const getReceipt = await newAccount.getReceipt(client);
  const newAccountId = getReceipt.accountId;

  //Log the account ID
  console.log("The new account ID is: " + newAccountId);

  //Verify the account balance
  const accountBalance = await new AccountBalanceQuery()
    .setAccountId(newAccountId)
    .execute(client);

  console.log(
    "The new account balance is: " +
      accountBalance.hbars.toTinybars() +
      " tinybar."
  );

  console.log("public key", typeof newAccountPublicKey);

  return {
    accountId: newAccountId,
    publicKey: newAccountPublicKey,
    privateKey: newAccountPrivateKey,
  };
}

async function sendCertificate(operator, sender, receiver) {
  const operatorId = operator.accountId;
  const operatorKey = operator.privateKey;
  const treasuryId = sender.accountId;
  const treasuryKey = sender.privateKey;
  const aliceId = receiver.accountId;
  const aliceKey = receiver.privateKey;

  let client = Client.forTestnet().setOperator(operatorId, operatorKey);
  const supplyKey = PrivateKey.generate();

  let nftCreate = await new TokenCreateTransaction()
    .setTokenName("diploma")
    .setTokenSymbol("GRAD")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(treasuryId)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(250)
    .setSupplyKey(supplyKey)
    // .setTransactionMemo("")
    .freezeWith(client);

  let nftCreateTxSign = await nftCreate.sign(treasuryKey);

  //Submit the transaction to a Hedera network
  let nftCreateSubmit = await nftCreateTxSign.execute(client);

  //Get the transaction receipt
  let nftCreateRx = await nftCreateSubmit.getReceipt(client);

  //Get the token ID
  let tokenId = nftCreateRx.tokenId;

  //Log the token ID
  console.log(`- Created NFT with Token ID: ${tokenId} \n`);

  //IPFS content identifiers for which we will create a NFT
  // CID = ["QmTzWcVfk88JRqjTpVwHzBeULRTNzHY7mnBSG42CpwHmPa"];

  let enc = new TextEncoder();
  let data = enc.encode("tfrbgtymh");

  // Mint new NFT
  let mintTx = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .setMetadata(data)
    .freezeWith(client);

  //Sign the transaction with the supply key
  let mintTxSign = await mintTx.sign(supplyKey);

  //Submit the transaction to a Hedera network
  let mintTxSubmit = await mintTxSign.execute(client);

  //Get the transaction receipt
  let mintRx = await mintTxSubmit.getReceipt(client);

  //Log the serial number
  console.log(
    `- Created NFT ${tokenId} with serial: ${mintRx.serials[0].low} \n`
  );

  //Create the associate transaction and sign with Alice's key
  let associateAliceTx = await new TokenAssociateTransaction()
    .setAccountId(aliceId)
    .setTokenIds([tokenId])
    .freezeWith(client)
    .sign(aliceKey);

  //Submit the transaction to a Hedera network
  let associateAliceTxSubmit = await associateAliceTx.execute(client);

  //Get the transaction receipt
  let associateAliceRx = await associateAliceTxSubmit.getReceipt(client);

  //Confirm the transaction was successful
  console.log(
    `- NFT association with Alice's account: ${associateAliceRx.status}\n`
  );

  // Check the balance before the transfer for the treasury account
  var balanceCheckTx = await new AccountBalanceQuery()
    .setAccountId(treasuryId)
    .execute(client);
  console.log(
    `- Treasury balance: ${balanceCheckTx.tokens._map.get(
      tokenId.toString()
    )} NFTs of ID ${tokenId}`
  );

  // Check the balance before the transfer for Alice's account
  var balanceCheckTx = await new AccountBalanceQuery()
    .setAccountId(aliceId)
    .execute(client);
  console.log(
    `- Alice's balance: ${balanceCheckTx.tokens._map.get(
      tokenId.toString()
    )} NFTs of ID ${tokenId}`
  );

  // Transfer the NFT from treasury to Alice
  // Sign with the treasury key to authorize the transfer
  let tokenTransferTx = await new TransferTransaction()
    .addNftTransfer(tokenId, 1, treasuryId, aliceId)
    .freezeWith(client)
    .sign(treasuryKey);

  let tokenTransferSubmit = await tokenTransferTx.execute(client);
  let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

  console.log(
    `\n- NFT transfer from Treasury to Alice: ${tokenTransferRx.status} \n`
  );

  // Check the balance of the treasury account after the transfer
  var balanceCheckTx = await new AccountBalanceQuery()
    .setAccountId(treasuryId)
    .execute(client);
  console.log(
    `- Treasury balance: ${balanceCheckTx.tokens._map.get(
      tokenId.toString()
    )} NFTs of ID ${tokenId}`
  );

  // Check the balance of Alice's account after the transfer
  var balanceCheckTx = await new AccountBalanceQuery()
    .setAccountId(aliceId)
    .execute(client);
  console.log(
    `- Alice's balance: ${balanceCheckTx.tokens._map.get(
      tokenId.toString()
    )} NFTs of ID ${tokenId}`
  );

  client = Client.forTestnet();

  client.setOperator(receiverDetails.accountId, receiverDetails.privateKey);

  let query = new AccountBalanceQuery().setAccountId(receiverDetails.accountId);

  //Sign with the client operator private key and submit to a Hedera network
  const tokenBalance = await query.execute(client);

  console.log(
    "The token balance(s) for this account: " + tokenBalance.tokens.toString()
  );

  query = new TokenInfoQuery().setTokenId(tokenId);

  //Sign with the client operator private key, submit the query to the network and get the token supply
  const tokenSupply = (await query.execute(client)).totalSupply;

  console.log(tokenSupply.toString());
}

async function hederaTransaction() {
  // senderDetails = await createAccount(500);
  // receiverDetails = await createAccount(0);
  //   console.log(senderDetails);
  //   console.log(receiverDetails);
  // let certificateSent = sendCertificate(
  //   senderDetails,
  //   senderDetails,
  //   receiverDetails
  // );

  makeFileObjects();
  let cid = storeFiles();

  console.log(cid);
}

module.exports = { hederaTransaction };
