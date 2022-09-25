const { Web3Storage, File } = require("web3.storage");

function getAccessToken() {
  return process.env.WEB3STORAGE_TOKEN;
}
function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

function makeFileObjects(obj, file_name) {
  const file = new File([JSON.stringify(obj)], file_name+".txt");
  return [file];
}

async function storeFile(file) {
  console.log("Storing the File");
  const client = makeStorageClient();
  const cid = await client.put(file);
  console.log("stored files with cid:", cid);
  return cid;
}

async function retrieveFileContents(cidList) {
  console.log("CIDLIST", cidList);
  const client = makeStorageClient();
  let allFiles = { files: [] };

  for (const cid of cidList) {
    const res = await client.get(cid);

    console.log(`Got a response! [${res.status}] ${res.statusText}`);
    if (!res.ok) {
      throw new Error(`failed to get ${cid}`);
    }

    const files = await res.files();

    for (const file of files) {
      let fileData = await file.text();
      let jsonObject = JSON.parse(fileData);
      allFiles.files.push({ fileName: file.name, fileContents: jsonObject });
    }
  }

  console.log("ALL FILES", allFiles);
  return allFiles;
}

module.exports = { makeFileObjects, storeFile, retrieveFileContents };
