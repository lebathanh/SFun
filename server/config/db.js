const mongoose = require("mongoose");

function connect() {
  mongoose.connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.rzzh1.mongodb.net/SocialNetwork?authSource=admin&replicaSet=atlas-i7aa56-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true`,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err) {
      if (err) {
        // eslint-disable-next-line no-console
        console.log("mongo connected erro: " + err);
      } else {
        // eslint-disable-next-line no-console
        console.log("mongo connected succesfull.");
      }
    }
  );
}
module.exports = { connect };
