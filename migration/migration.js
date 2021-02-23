import * as db from "./models/index.js";
import readline from "readline";

import * as mongoose from "./src/mongoose.js";
import * as dynamoose from "./src/dynamoose.js";
import * as sdk from "./src/aws_sdk.js";
import * as convert from "./src/convert.js";

// var ddb = new AWS.DynamoDB({ apiVersion: "2021-01-18", maxRetries: 5 });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

db.conn_mongo();
db.conn_dynamo();
db.conn_aws_sdk();

function input() {
    return new Promise(function (resolve, reject) {
        let command;
        let db;
        let tablename;
        let filename;
        let option;
        let input_filename;
        let output_filename;
        let logic;
        rl.question(
            '\
      ================================================================================\n\
      This is Migration tool for DynamoDB and MongoDB\n\
      Please type a command with below Format.\n\
      { export | import } { SDK | dynamo | mongo } { table_name } { filename } { option }\n\
      { convert } { input_filename } { output_filename } { convert_logic_filename } \n\
      (ex) export mongo movie2 test {"title":"abc","score":"25","andor":"or"}\n\
      Ctrl+C to quit this program.\n\
      ================================================================================\n\
      ',
            (line) => {
                let input = line.split(" ");
                command = input[0];
                if (command == "convert") {
                    input_filename = input[1];
                    output_filename = input[2];
                    logic = input[3];
                } else {
                    db = input[1];
                    tablename = input[2];
                    filename = input[3];
                    option = input[4];
                }
                rl.close();
                resolve({
                    command: command,
                    db: db,
                    tablename: tablename,
                    filename: filename,
                    option: option,
                    input_filename: input_filename,
                    output_filename: output_filename,
                    logic: logic,
                });
            }
        );
    });
}

async function main() {
    input().then((res) => {
        console.log(res);
        let option = {};
        if (res.option != "" && res.option != undefined) {
            option = JSON.parse(res.option);
        } else {
            option = null;
        }
        // console.log(option);
        if (res.db == "mongo") {
            if (res.command == "export") {
                mongoose.mongo_export(res, option);
            } else {
                mongoose.mongo_import(res);
            }
        } else if (res.db == "dynamo") {
            if (res.command == "export") {
                dynamoose.dynamo_export(res, option);
            } else {
                dynamoose.dynamo_import(res);
            }
        } else if (res.db == "sdk") {
            if (res.command == "export") {
                sdk.sdk_export(res, option);
            } else {
                sdk.sdk_import(res);
            }
        }
        if (res.command == "convert") {
            convert.convert(res);
        }
    });
}

main();
