import mongoose from "mongoose";
import * as dynamoose from "dynamoose";
import AWS from "aws-sdk";
import config from "../config/config";

mongoose.Promise = global.Promise;
const mongo = config.db.mongo;

const MONGO_URL = `mongodb://${mongo.username}:${mongo.password}@${mongo.host}:${mongo.port}/${mongo.tablename}`;
// Connect to mongoDB
function conn_mongo() {
  mongoose
    .connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("MongoDB Connected!!");
    })
    .catch((err) => {
      console.log(err);
    });
}

function conn_dynamo() {
  dynamoose.aws.sdk.config.update({
    accessKeyId: config.aws.accessid,
    secretAccessKey: config.aws.scretid,
    region: config.aws.region,
  });
  console.log("DynamoDB Connected!!");
}

function conn_aws_sdk() {
  AWS.config.update({
    accessKeyId: config.aws.accessid,
    secretAccessKey: config.aws.scretid,
    region: config.aws.region,
  });
  console.log("AWS-SDK Connected!!");
}

module.exports = {
  conn_mongo,
  conn_dynamo,
  conn_aws_sdk,
};
