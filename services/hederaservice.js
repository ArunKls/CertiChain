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
  AccountInfoQuery,
  TokenAssociateTransaction,
  AccountCreateTransaction,
  Hbar,
  TokenInfoQuery,
} = require("@hashgraph/sdk");
const { query } = require("express");

require("dotenv").config();

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
    accountId: newAccountId.toString(),
    publicKey: newAccountPublicKey.toString(),
    privateKey: newAccountPrivateKey.toString(),
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
async function createToken(operator, cid) {
  const operatorAccountId = operator.accountId;
  const operatorPrivateKey = operator.privateKey;

  console.log(operatorAccountId);
  console.log(operatorPrivateKey);

  let client = Client.forTestnet().setOperator(
    operatorAccountId,
    operatorPrivateKey
  );

  const transaction = await new TokenCreateTransaction()
    .setTokenName("USD Bar")
    .setTokenSymbol("USDB")
    .setTokenMemo(cid.toString())
    .setTreasuryAccountId(operatorAccountId)
    .setInitialSupply(0)
    .setDecimals(2)
    .setAutoRenewAccountId(operatorAccountId)
    .setMaxTransactionFee(new Hbar(20)) //Change the default max transaction fee
    .freezeWith(client);

  console.log("OPERATOR PRIVATE KEY", operatorPrivateKey);
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

  const tokenId = transactionReceipt.tokenId;

  console.log("The new token ID is " + tokenId);

  return tokenId;
}

async function sendToken(operator, sender, receiver, tokenId) {
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

  let senderClient = Client.forTestnet().setOperator(
    senderAccountId,
    senderPrivateKey
  );

  let receiverClient = Client.forTestnet().setOperator(
    receiverAccountId,
    receiverPrivateKey
  );

  let associateReceiverTx = await new TokenAssociateTransaction()
    .setAccountId(receiverAccountId)
    .setTokenIds([tokenId])
    .freezeWith(client)
    .sign(receiverPrivateKey);

  //SUBMIT THE TRANSACTION
  let associateReceiverTxSubmit = await associateReceiverTx.execute(client);

  //GET THE RECEIPT OF THE TRANSACTION
  let associateReceiverRx = await associateReceiverTxSubmit.getReceipt(client);

  //LOG THE TRANSACTION STATUS
  console.log(
    `- Token association with Receiver's account: ${associateReceiverRx.status} \n`
  );

  //Get the token ID from the receipt
  // let accBa
  // var balanceCheckTx = await new AccountBalanceQuery()
  //   .setAccountId(receiverDetails.accountId)
  //   .execute(receiverClient);

  // console.log(balanceCheckTx.tokens.toString());

  // console.log(
  //   `- Receiver's balance: ${balanceCheckTx.tokens._map.get(
  //     tokenId.toString()
  //   )} Tokens of ID ${tokenId}`
  // );

  //Request the cost of the query
  // const queryCost = await new AccountBalanceQuery()
  //   .setAccountId(receiverAccountId)
  //   .getCost(client);

  // console.log("The cost of query is: " + queryCost);
  // for(var i = 0; i < balanceCheckTx.length; i++) {

  // }
}

async function getBalance(clientDetails, name, getTokenCid) {
  let result = [];
  let client = Client.forTestnet().setOperator(
    clientDetails.accountId,
    clientDetails.privateKey
  );
  let accBalClientQuery = new AccountBalanceQuery().setAccountId(
    clientDetails.accountId
  );
  console.log("INSIDE GET BALANCE");

  accBalClientQuery.execute(client, async function (clientAccBalance) {
    console.log("INSIDE THE FIXED FUNCTION");
  });

  let clientAccBalance = await accBalClientQuery.execute(client);

  console.log("AMOUNT", clientAccBalance.hbars.toString());

  if (getTokenCid === true) {
    let response = await getCID(clientAccBalance, client);

    return response;
  } else {
    return result;
  }
}

async function getCID(clientAccBalance, client) {
  let result = [];

  let map = clientAccBalance.tokens._map;

  map.forEach(function (value, key) {
    let query = new TokenInfoQuery().setTokenId(key);

    let v = getTokenMemo(query, client);
    result.push(v);
  });

  return result;
}

async function getTokenMemo(query, client) {
  console.log("INSIDE GET MEMO");
  let v = await query.execute(client);
  return v.tokenMemo;
}

module.exports = {
  createAccount,
  sendCertificate,
  createToken,
  sendToken,
  getBalance,
};
