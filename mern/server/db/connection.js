import { MongoClient } from "mongodb";
const Db = "mongodb+srv://User:AliPar123@cluster0.q6ruioz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(Db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
 
let _db;

const connectToServer = (callback) => {
  client.connect((err, db) => {
    if (db) {
      _db = db.db("employees");
      console.log("Successfully connected to MongoDB.");
    }
    return callback(err);
  });
};

const getDb = () => {
  return _db;
};

export { connectToServer, getDb };
