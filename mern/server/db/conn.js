const { MongoClient } = require("mongodb");
const Db = "mongodb+srv://User:AliPar123@cluster0.q6ruioz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const client = new MongoClient(Db);

let _db;

module.exports = {
  connectToServer: async function (callback) {

    try {
      await client.connect();
    } catch (e) {
      console.error(e);
    }

    _db = client.db("employees");

    return (_db === undefined ? false : true);
  },
  getDb: function () {
    return _db;
  },
};
