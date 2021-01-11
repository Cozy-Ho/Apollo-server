import mongoose from "mongoose";

mongoose.Promise = global.Promise;

const MONGO_URL = `mongodb://admin:admin@localhost:27017/admin`;
// Connect to mongoDB
module.exports = () => {
  mongoose
    .connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("MongoDB Connected");
    })
    .catch((err) => {
      console.log(err);
    });
};
