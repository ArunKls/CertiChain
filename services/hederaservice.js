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
  TokenInfoQuery,
} = require("@hashgraph/sdk");

require("dotenv").config();
const { Web3Storage, File } = require("web3.storage");
const { Blob } = require("buffer");

function getAccessToken() {
  return process.env.WEB3STORAGE_TOKEN;
}
function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

function makeFileObjects() {
  const obj = {
    "Certificate Name": "test35444444",
    "Certificate Details": "tsss",
  };
  const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });
  const file = new File([blob], "certificate3.json");
  return [file];
}

async function storeFiles(file) {
  console.log("Storing the File");
  const client = makeStorageClient();
  const cid = await client.put(file);
  console.log("stored files with cid:", cid);
  return cid;
}

async function retrieveFileContents(cid) {
  const client = makeStorageClient();
  const res = await client.get(cid);

  console.log(`Got a response! [${res.status}] ${res.statusText}`);
  if (!res.ok) {
    throw new Error(`failed to get ${cid}`);
  }

  const files = await res.files();

  console.log(files);

  for (const file of files) {
    // console.log(JSON.stringify(file));

    let fileData = await file.text();
    console.log(typeof fileData);
  }
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

async function sendTransaction(operator, sender, receiver) {
  const operatorAccountId = operator.accountId;
  const operatorPrivateKey = operator.privateKey;
  const senderAccountId = sender.accountId;
  const senderPrivateKey = sender.privateKey;
  const receiverAccountId = receiver.accountId;
  const receiverPrivateKey = receiver.privateKey;

  // Create our connection to the Hedera network
  // The Hedera JS SDK makes this really easy!
  let client = Client.forTestnet().setOperator(
    operatorAccountId,
    operatorPrivateKey
  );

  const transaction = await new TokenCreateTransaction()
    .setTokenName("USD Bar")
    .setTokenSymbol("USDB")
    .setTokenMemo("abcdefg")
    .setTreasuryAccountId(operatorAccountId)
    .setInitialSupply(10000)
    .setDecimals(2)
    .setAutoRenewAccountId(operatorAccountId)
    .setAutoRenewPeriod(7000000)
    .setMaxTransactionFee(new Hbar(30)) //Change the default max transaction fee
    .freezeWith(client);

  //Sign the transaction with the token treasury account private key
  const signTx = await transaction.sign(operatorPrivateKey);

  //Sign the transaction with the client operator private key and submit it to a Hedera network
  const txResponse = await signTx.execute(client);

  //Verify the transaction reached consensus
  const transactionReceipt = await txResponse.getReceipt(client);
  console.log(
    "The transfer transaction from my account to the new account was: " +
      transactionReceipt.status.toString()
  );

  //Get the token ID from the receipt
  const tokenId = transactionReceipt.tokenId;

  console.log("The new token ID is " + tokenId);

  //Request the cost of the query
  // const queryCost = await new AccountBalanceQuery()
  //   .setAccountId(receiverAccountId)
  //   .getCost(client);

  // console.log("The cost of query is: " + queryCost);

  client.setOperator(receiverDetails.accountId, receiverDetails.privateKey);

  query = new TokenInfoQuery().setTokenId(tokenId);

  //Sign with the client operator private key, submit the query to the network and get the token supply
  const tokenSupply = (await query.execute(client)).tokenMemo;

  console.log(tokenSupply.toString());

  let senderClient = Client.forTestnet().setOperator(
    senderAccountId,
    senderPrivateKey
  );

  let accBalSenderQuery = new AccountBalanceQuery().setAccountId(
    senderDetails.accountId
  );

  //Sign with the client operator private key and submit to a Hedera network
  const senderAccBalance = await accBalSenderQuery.execute(senderClient);

  console.log(
    "The account balance for sender: " + senderAccBalance.hbars.toString()
  );

  let receiverClient = Client.forTestnet().setOperator(
    receiverAccountId,
    receiverPrivateKey
  );

  let accBalReceiverQuery = new AccountBalanceQuery().setAccountId(
    receiverDetails.accountId
  );

  //Sign with the client operator private key and submit to a Hedera network
  const receiverAccBalance = await accBalReceiverQuery.execute(receiverClient);

  console.log(
    "The account balance for receiver: " + receiverAccBalance.hbars.toString()
  );
}

async function hederaTransaction() {
  // senderDetails = await createAccount(15);
  // receiverDetails = await createAccount(10);

  // let certificateSent = sendTransaction(
  //   senderDetails,
  //   senderDetails,
  //   receiverDetails
  // );

  let file = makeFileObjects();
  console.log("FILE", file);
  let cid = await storeFiles(file);
  console.log(cid);

  retrieveFileContents(cid);
}

module.exports = { hederaTransaction };
