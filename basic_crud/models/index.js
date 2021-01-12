// import mongoose from "mongoose";

// mongoose.Promise = global.Promise;

// const MONGO_URL = `mongodb://admin:adminpw@localhost:27017/admin`;
// // Connect to mongoDB
// module.exports = () => {
//   mongoose
//     .connect(MONGO_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     .then(() => {
//       console.log("MongoDB Connected");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

// dynamoose setting.
import * as dynamoose from "dynamoose";

module.exports = () => {
  dynamoose.aws.sdk.config.update({
    region: "us-east-2",
  });
  console.log("Dynamo_conn Setted.");
};
