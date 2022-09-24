/*
username= sri
host = free-tier14.aws-us-east-1.cockroachlabs.cloud
password = MVD5CEJS3k9C-0DN27U0Hg
port = 26257
database = defaultdb

*/

const Sequelize = require("sequelize");
const fs = require("fs");

let sequelize = new Sequelize(
  // {
  //   dialect: "postgres",
  //   username: "avnadmin",
  //   password: "AVNS_zRGb8EI4Qd4XxiITPik",
  //   host: "pg-3d82c9b9-arunkls195-f6c0.aivencloud.com",
  //   port: 27159,
  //   // cluster_name: "whole-forager-5183",
  //   database: "defaultdb",

  //   dialectOptions: {
  //     ssl: {
  //       ca: fs.readFileSync("./middleware/ca.cer").toString(),
  //     },
  //   },

  //   logging: false,
  // }
  process.env.DATABASE_URL
);

const User = sequelize.define("users", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
  },

  firstName: {
    type: Sequelize.STRING,
  },

  lastName: {
    type: Sequelize.STRING,
  },

  emailId: {
    type: Sequelize.STRING,
    unique: true,
  },

  password: {
    type: Sequelize.STRING,
  },

  role: {
    type: Sequelize.INTEGER,
  },

  publicKey: {
    type: Sequelize.STRING,
  },

  privateKey: {
    type: Sequelize.STRING,
  },

  accountId: {
    type: Sequelize.STRING,
  },

  token: {
    type: Sequelize.STRING,
  },
});

User.sync();

module.exports = { User };
