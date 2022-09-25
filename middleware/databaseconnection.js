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

const Academics = sequelize.define("academics", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
  },

  studentId: {
    type: Sequelize.INTEGER,
    references: "users",
    referencesKey: "id",
  },

  degree: {
    type: Sequelize.STRING,
  },

  schoolName: {
    type: Sequelize.STRING,
  },

  division: {
    type: Sequelize.STRING,
  },

  year: {
    type: Sequelize.INTEGER,
  },
});

User.sync();
Academics.sync();

module.exports = { User, Academics };
