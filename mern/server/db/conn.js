const { MongoClient } = require("mongodb");
require('dotenv').config();  // Load environment variables from .env file

const Db = process.env.URI;
console.log(Db)
const client = new MongoClient(Db);

let _db;

module.exports = {
  connectToServer: async function (callback) {

    try {
      await client.connect();
    } catch (e) {
      console.error(e);
    }

    _db = client.db("users");

    return (_db === undefined ? false : true);
  },
  getDb: function () {
    return _db;
  },
};
