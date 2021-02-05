import { conn_mongo, conn_dynamo } from "./models/index.js";
import fs from "fs";
import readline from "readline";
import mongoose from "mongoose";
import dynamoose from "dynamoose";

import mongoSchema from "./models/mongo.js";
import dynamoSchema from "./models/dynamo.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

conn_mongo();
conn_dynamo();

function input() {
  return new Promise(function (resolve, reject) {
    let command;
    let db;
    let tablename;
    let filename;
    rl.question(
      "This is Migration tool for DynamoDB and MongoDB\nPlease type a command.\n{ export | import } { dynamo | mongo } { table_name } { filename }\nCtrl+C to quit this program.\n",
      (line) => {
        let input = line.split(" ");
        command = input[0];
        db = input[1];
        tablename = input[2];
        filename = input[3];
        rl.close();
        resolve({
          command: command,
          db: db,
          tablename: tablename,
          filename: filename,
        });
      }
    );
  });
}

async function dynamo_find(res) {
  const Movie = dynamoose.model(res.tablename, dynamoSchema);
  let movies = await Movie.query("dumy").eq(1).exec();
  let ret_arr = [];
  ret_arr.push(movies.toJSON());
  let flag;
  let key = movies.lastKey;
  if (key) {
    flag = true;
  } else {
    flag = false;
  }
  while (flag) {
    let temp = await Movie.query("dumy").eq(1).startAt(key).exec();
    ret_arr.push(temp.toJSON());
    if (temp.lastKey === undefined) {
      flag != flag;
      break;
    } else {
      key = temp.lastKey;
    }
  }
  return ret_arr;
}
async function dynamo_put(res) {
  const Movie = dynamoose.model(res.tablename, dynamoSchema);
  let data = fs.readFileSync(`./data/${res.filename}.json`, "utf8");
  console.log(JSON.parse(data));
  data = JSON.parse(data);
  let item_arr = [];
  for (let i = 0; i < data.length; i++) {
    item_arr.push({
      dumy: 1,
      id: data[i].id,
      title: data[i].title,
      socre: data[i].score,
      desc: data[i].desc,
      s_title: data[i].title,
      s_score: data[i].score,
      s_desc: data[i].desc,
      watched: data[i].watched,
      info: data[i].info,
    });
  }
  for (let i = 0; i < item_arr.length / 25 + 1; i++) {
    let begin = i * 25;
    let end = begin + 25;
    if (!item_arr[begin]) break;
    await Movie.batchPut(item_arr.slice(begin, end));
    console.log("MIGRATING>>>>" + i);
  }
  return true;
}

async function main() {
  input().then((res) => {
    console.log(res);

    if (res.db == "mongo") {
      let Movie = mongoose.model(res.tablename, mongoSchema);
      if (res.command == "export") {
        Movie.find()
          .then((data) => {
            console.log(data);
            const buf = Buffer.from(JSON.stringify(data));
            fs.writeFile(`./data/${res.filename}.json`, buf, function (err) {
              if (err) console.log(err);
              else console.log("DONE>>>");
            });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        fs.readFile(
          `./data/${res.filename}.json`,
          "utf8",
          function (err, data) {
            if (err) {
              console.log(err);
            } else {
              console.log(JSON.parse(data));
              data = JSON.parse(data);
              for (let i = 0; i < data.length; i++) {
                Movie.insertMany(data[i]);
              }
            }
          }
        );
      }
    } else if (res.db == "dynamo") {
      if (res.command == "export") {
        dynamo_find(res).then((data) => {
          let ret_arr = data.flat();
          console.log(ret_arr);
          const buf = Buffer.from(JSON.stringify(ret_arr));
          fs.writeFile(`./data/${res.filename}.json`, buf, function (err) {
            if (err) console.log(err);
            else console.log("DONE>>>");
          });
        });
      } else {
        dynamo_put(res);
      }
    }
  });
}
main();
