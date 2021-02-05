/*
ENV_FORMAT

    MONGO_USER_NAME=
    MONGO_USER_PW=
    MONGO_TABLE_NAME=
    MONGO_HOST=
    MONGO_PORT=

    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_DEFAULT_REGION=
 
*/

import path from "path";
import dotenv from "dotenv";

var config = {};
// DB 선택 초기값
let select = "dynamo";
const __dirname = path.resolve();

dotenv.config({ path: path.join(__dirname, "config/.env") });
const env = process.env;

var db = {};

db.mongo = {
  host: env.MONGO_HOST,
  port: env.MONGO_PORT,
  username: env.MONGO_USER_NAME,
  password: env.MONGO_USER_PW,
  tablename: env.MONGO_TABLE_NAME,
};

var aws = {
  accessid: env.AWS_ACCESS_KEY_ID,
  scretid: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_DEFAULT_REGION,
};

config.db = db;
config.aws = aws;
config.select = select;

export default config;
