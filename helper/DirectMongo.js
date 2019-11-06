const MongoClient = require('mongodb').MongoClient;
let DEFAULT_URL = 'mongodb://localhost:27017/gggeo';

class DirectMongo {
  constructor(options = {}) {
    this.connectUrl = options.url || process.env.DATABASE_URI || DEFAULT_URL;
  }

  connect() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.connectUrl || process.env.PARSE_SERVER_DATABASE_URI || DEFAULT_URL, function(err, db) {
        if (err) reject(err);
        DirectMongo.DB = db.db(db.s.options.dbName);
        resolve(DirectMongo.DB);
      });
    });
  }
}
DirectMongo.DB = null; //static

module.exports = DirectMongo;