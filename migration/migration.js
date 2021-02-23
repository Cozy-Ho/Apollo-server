import AWS from "aws-sdk";
import { conn_mongo, conn_dynamo, conn_aws_sdk } from "./models/index.js";
import fs from "fs";
import readline from "readline";
import mongoose from "mongoose";
import dynamoose from "dynamoose";

import mongoSchema from "./models/mongo.js";
import dynamoSchema from "./models/dynamo.js";
import * as convert_logic from "./convert_logic.js";

AWS.config.update({ region: "ap-northeast-2" });
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2021-01-18",
    maxRetries: 10,
});
// var ddb = new AWS.DynamoDB({ apiVersion: "2021-01-18", maxRetries: 5 });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

conn_mongo();
conn_dynamo();
conn_aws_sdk();

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

async function dynamo_search(movies, option) {
    let key = Object.getOwnPropertyNames(option);
    console.log(key);

    if (option.andor == "and" || option.andor == null) {
        if (key.includes("title")) {
            movies = movies.and().where("title").eq(option.title);
        }
        if (key.includes("score")) {
            movies = movies.and().where("score").eq(option.score);
        }
        if (key.includes("desc")) {
            movies = movies.and().where("desc").eq(option.desc);
        }
        if (key.includes("watched")) {
            movies = movies.and().where("watched").eq(option.watched);
        }
        if (key.includes("info")) {
            let info_key = Object.getOwnPropertyNames(option["info"]);
            console.log(info_key);
            if (info_key.includes("lang")) {
                movies = movies.and().where("info.lang").eq(option.info.lang);
            }
            if (info_key.includes("subtitle")) {
                movies = movies.and().where("info.subtitle").eq(option.info.subtitle);
            }
            if (info_key.includes("dubbing")) {
                movies = movies.and().where("info.dubbing").eq(option.info.dubbing);
            }
        }
    } else if (option.andor == "or") {
        movies = movies.and().parenthesis((condition) => {
            if (key.includes("title")) {
                condition = condition.or().where("s_title").eq(option.title);
            }
            if (key.includes("score")) {
                condition = condition.or().where("s_score").eq(option.score);
            }
            if (key.includes("desc")) {
                condition = condition.or().where("s_desc").eq(option.desc);
            }
            if (key.includes("watched")) {
                condition = condition.or().where("watched").eq(option.watched);
            }
            if (key.includes("info")) {
                let info_key = Object.getOwnPropertyNames(option["info"]);
                console.log(info_key);
                if (info_key.includes("lang")) {
                    condition = condition.or().where("info.lang").eq(option.info.lang);
                }
                if (info_key.includes("subtitle")) {
                    condition = condition.or().where("info.subtitle").eq(option.info.subtitle);
                }
                if (info_key.includes("dubbing")) {
                    condition = condition.or().where("info.dubbing").eq(option.info.dubbing);
                }
            }
            return condition;
        });
    }
    return movies;
}
async function dynamo_find(res, option) {
    const Movie = dynamoose.model(res.tablename, dynamoSchema);
    let ret_arr = [];
    let movies;
    if (option) {
        movies = await Movie.query("dumy").eq(1);
        movies = await dynamo_search(movies, option);
        movies = await movies.exec();
        ret_arr.push(movies.toJSON());
        return ret_arr;
    }
    movies = await Movie.query("dumy").eq(1).exec();
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
    //   console.log(JSON.parse(data));
    data = JSON.parse(data);
    data = data.flat();
    console.log(data.length, "개 데이터를 migration 합니다.");
    let item_arr = [];
    let remain_arr = [];
    for (let i = 0; i < data.length; i++) {
        item_arr.push({
            dumy: data[i].dumy || 1,
            id: data[i].id,
            title: data[i].title,
            socre: data[i].score || 0,
            desc: data[i].desc || "",
            s_title: data[i].title || "",
            s_score: data[i].score || 0,
            s_desc: data[i].desc || "",
            watched: data[i].watched || false,
            info: data[i].info || null,
        });
    }
    for (let i = 0; i < item_arr.length / 25 + 1; i++) {
        let begin = i * 25;
        let end = begin + 25;
        if (!item_arr[begin]) break;
        await Movie.batchPut(item_arr.slice(begin, end))
            .then((res) => {
                console.log("MIGRATING>>>>", res, i);
            })
            .catch((err) => {
                console.log("ERROR >>>", err);
                remain_arr.push(i);
            });
    }
    for (let i = 0; i < remain_arr.length; i++) {
        let begin = remain_arr[i] * 25;
        let end = begin + 25;
        if (!remain_arr[begin]) break;
        await Movie.batchPut(remain_arr.slice(begin, end))
            .then((res) => {
                console.log("REMAIN_DONE >>> ", res, i);
            })
            .catch((err) => {
                console.log("REMAIN_ERROR >>> ", err);
                remain_arr.push(i);
            });
    }
    return true;
}

function sdk_search(params) {
    let ret_arr = [];
    return new Promise(function (resolve, reject) {
        console.log(params);
        docClient.scan(params, async function (err, data) {
            if (err) {
                console.log(err);
                return reject(err);
            } else {
                let key = data.LastEvaluatedKey;
                ret_arr.push(data.Items);
                if (key) {
                    params.ExclusiveStartKey = key;
                    let data = await sdk_search(params, processRemainItemsCallback);
                    ret_arr.push(data);
                }
                ret_arr = ret_arr.flat();
                // console.log(ret_arr);
                console.log(">>> SEARCH_DONE >>>", ret_arr.length);
                return resolve(ret_arr);
            }
        });
    });
}
async function sdk_find(params, option) {
    let movies;
    // 1. search
    let key = Object.getOwnPropertyNames(option);
    // and,or 검색 조건부
    let filter = [];
    if (key.includes("title")) {
        params.ExpressionAttributeValues[":t"] = option["title"];
        filter.push("s_title=:t");
    }
    if (key.includes("score")) {
        params.ExpressionAttributeValues[":s"] = option["score"];
        filter.push("s_score=:s");
    }
    if (key.includes("desc")) {
        params.ExpressionAttributeValues[":d"] = option["desc"];
        // DB reserved name 사용
        params.ExpressionAttributeNames = {
            "#desc": "s_desc",
        };
        filter.push("#desc=:d");
    }
    if (key.includes("watched")) {
        params.ExpressionAttributeValues[":w"] = option["watched"];
        filter.push("watched=:w");
    }
    if (key.includes("info")) {
        let info_key = Object.getOwnPropertyNames(option["info"]);
        console.log(info_key);
        if (info_key.includes("lang")) {
            params.ExpressionAttributeValues[":l"] = option["info"].lang;
            filter.push("info.lang=:l");
        }
        if (info_key.includes("subtitle")) {
            params.ExpressionAttributeValues[":sub"] = option["info"].subtitle;
            filter.push("info.subtitle=:sub");
        }
        if (info_key.includes("dubbing")) {
            params.ExpressionAttributeValues[":dub"] = option["info"].dubbing;
            filter.push("info.dubbing=:dub");
        }
    }

    // AND or OR search
    if (option.andor == "and" || option.andor == null) {
        params.FilterExpression = filter.join(" and ");
    } else if (option.andor == "or") {
        params.FilterExpression = filter.join(" or ");
    }
    movies = await sdk_search(params);
    return movies;
}
async function sdk_put(res) {
    let data = fs.readFileSync(`./data/${res.filename}.json`, "utf8");
    // console.log(data);
    data = JSON.parse(data);
    data = data.flat();
    console.log(data.length, "개 데이터를 Migration 합니다.");
    let item_arr = [];
    for (let i = 0; i < data.length; i++) {
        // console.log(typeof data[i]);
        let items = {};
        for (let j = 0; j < Object.keys(data[i]).length; j++) {
            // console.log(data[i]);
            let key = Object.keys(data[i])[j];
            let value = Object.values(data[i])[j];
            console.log(key);
            items[key] = value;
        }
        item_arr.push({
            PutRequest: {
                Item: items,
            },
        });
    }

    let param_arr = [];
    for (let i = 0; i < item_arr.length / 25 + 1; i++) {
        let begin = i * 25;
        let end = begin + 25;
        if (!item_arr[begin]) break;
        let input_arr = item_arr.slice(begin, end);
        param_arr.push({
            RequestItems: {
                [res.tablename]: input_arr,
            },
        });
    }
    console.log("param_arr 생성완료");
    console.log(param_arr.length, "개.");

    let i = 0;
    let flow = 0;
    while (param_arr.length > 0) {
        let param = param_arr.pop();
        flow += 1;

        while (flow > 15) {
            console.log(">>> SLEEP >>>");
            await sleep(200);
        }
        // console.log("SENDING QUERY >>>");
        docClient.batchWrite(param, processItemsCallback);
    }
    async function processItemsCallback(err, data) {
        if (err) {
            if (err == "ProvisionedThroughputExceededException") {
                await sleep(5000);
            } else {
                console.log("ERR on CallBack>>> ", err);
            }
        } else {
            var params = {};
            params.RequestItems = data.UnprocessedItems;
            // console.log("unProcessedItem >>> ", data);
            if (Object.keys(params.RequestItems).length != 0) {
                await sleep(300).then(() => {
                    docClient.batchWrite(params, processItemsCallback);
                });
            } else {
                console.log("QUERY_SENDED >>> ", i);
                i += 1;
                flow -= 1;
            }
        }
    }
}

async function processRemainItemsCallback(err, data) {
    if (err) {
        console.log("ERR >>> ", err);
    } else {
        var params = {};
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        console.log("getMoreITEMS >>> ", data);
        if (Object.keys(params.ExclusiveStartKey).length != 0) {
            let data = await docClient.query(params, processRemainItemsCallback);
            return data.Items;
        }
    }
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
            let filename = res.filename;
            let Movie = mongoose.model(res.tablename, mongoSchema);
            if (res.command == "export") {
                try {
                    fs.unlinkSync(`./data/${res.filename}.json`);
                } catch (err) {
                    console.log("file not exist");
                }
                console.time("EXPORT");
                Movie.count({}, async function (err, count) {
                    console.log(count);
                    let len = count;
                    for (let i = 0; i < len / 100000 + 1; i++) {
                        let skip = i * 100000;
                        let limit = 100000;
                        await Movie.find(option)
                            .skip(skip)
                            .limit(limit)
                            .then(async (res) => {
                                const buf = await Buffer.from(JSON.stringify(res));
                                await fs.appendFileSync(`./data/${filename}_${i}.json`, buf);
                                console.log("DONE>>>", (i + 1) * 100000);
                            });
                    }
                    console.timeEnd("EXPORT");
                });
                // Movie.find(option)
                //     .then((data) => {
                //         // console.log(data);
                //         console.log(data.length, "개 데이터를 가져옵니다.");
                //         const buf = Buffer.from(JSON.stringify(data));
                //         fs.writeFile(`./data/${res.filename}.json`, buf, function (err) {
                //             if (err) console.log(err);
                //             else console.log("DONE>>>");
                //         });
                //     })
                //     .catch((err) => {
                //         console.log(err);
                //     });
            } else {
                console.time("IMPORT");
                fs.readdir("./data/", async function (err, filenames) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    await filenames.forEach(function (filename) {
                        if (filename.startsWith(res.filename)) {
                            fs.readFile(`./data/${filename}`, "utf8", async function (err, data) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    data = JSON.parse(data);
                                    console.log(data.length, "개 데이터를 저장합니다.");
                                    await Movie.insertMany(data);
                                }
                            });
                        }
                    });
                });
                console.timeEnd("IMPORT");
                // fs.readFile(`./data/${res.filename}.json`, "utf8", async function (err, data) {
                //     if (err) {
                //         console.log(err);
                //     } else {
                //         data = JSON.parse(data);
                //         data = data.flat(Infinity);
                //         console.log(data.length, "개 데이터를 저장합니다.");
                //         for (let i = 0; i < data.length / 100000 + 1; i++) {
                //             let begin = i * 100000;
                //             let end = begin + 100000;
                //             if (!data[begin]) break;
                //             await Movie.insertMany(data.slice(begin, end));
                //             console.log("MIGRATING >>> ", (i + 1) * 100000);
                //         }
                //         console.timeEnd("IMPORT");
                //     }
                // });
            }
        } else if (res.db == "dynamo") {
            if (res.command == "export") {
                console.time("EXPORT_TIME");
                dynamo_find(res, option).then((data) => {
                    let ret_arr = data.flat();
                    console.log(ret_arr.length, "개 데이터를 가져옵니다.");
                    const buf = Buffer.from(JSON.stringify(ret_arr));
                    fs.writeFile(`./data/${res.filename}.json`, buf, function (err) {
                        if (err) console.log(err);
                        else {
                            console.log("DONE>>>");
                            console.timeEnd("EXPORT_TIME");
                        }
                    });
                });
            } else {
                console.time("IMPORT_TIME");
                dynamo_put(res).then(() => {
                    console.timeEnd("IMPORT_TIME");
                });
            }
        } else if (res.db == "sdk") {
            let params = {
                TableName: res.tablename,
                ProjectionExpression: "dumy, id, title, score, #desc, info, watched",
            };
            params.ExpressionAttributeNames = {
                "#desc": "desc",
            };
            if (res.command == "export") {
                let ret_arr = [];
                if (option) {
                    console.time("EXPORT_TIME");
                    sdk_find(params, option).then((data) => {
                        // console.log(data);
                        ret_arr.push(data);
                        ret_arr = ret_arr.flat();
                        const buf = Buffer.from(JSON.stringify(ret_arr));
                        fs.writeFile(`./data/${res.filename}.json`, buf, function (err) {
                            if (err) console.log(err);
                            else {
                                console.log("DONE>>>");
                                console.timeEnd("EXPORT_TIME");
                            }
                        });
                    });
                } else {
                    console.time("EXPORT_TIME");
                    sdk_search(params).then((data) => {
                        console.log(data);
                        ret_arr.push(data);
                        ret_arr = ret_arr.flat();
                        const buf = Buffer.from(JSON.stringify(ret_arr));
                        fs.writeFile(`./data/${res.filename}.json`, buf, function (err) {
                            if (err) console.log(err);
                            else {
                                console.log("DONE>>>");
                                console.timeEnd("EXPORT_TIME");
                            }
                        });
                    });
                }
            } else {
                console.time("IMPORT_TIME");
                sdk_put(res).then(() => {
                    console.timeEnd("IMPORT_TIME");
                });
            }
        }
        if (res.command == "convert") {
            fs.readFile(`./data/${res.input_filename}.json`, "utf8", async function (err, data) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    let result;
                    data = JSON.parse(data);
                    data = data.flat();
                    // console.log(data.length);
                    result = convert_logic.main_logic(data, res.logic);
                    const buf = Buffer.from(JSON.stringify(result));
                    fs.writeFile(`./data/${res.output_filename}.json`, buf, function (err) {
                        if (err) console.log(err);
                        else {
                            console.log("DONE >>> ");
                        }
                    });
                }
            });
        }
    });
}

main();
