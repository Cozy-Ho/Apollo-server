import fs from "fs";
import AWS from "aws-sdk";

AWS.config.update({ region: "ap-northeast-2" });
var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2021-01-18",
    maxRetries: 10,
});

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

export function sdk_export(res, option) {
    let params = {
        TableName: res.tablename,
        ProjectionExpression: "dumy, id, title, score, #desc, info, watched",
    };
    params.ExpressionAttributeNames = {
        "#desc": "desc",
    };
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
}

export function sdk_import(res) {
    let params = {
        TableName: res.tablename,
        ProjectionExpression: "dumy, id, title, score, #desc, info, watched",
    };
    params.ExpressionAttributeNames = {
        "#desc": "desc",
    };
    console.time("IMPORT_TIME");
    sdk_put(res).then(() => {
        console.timeEnd("IMPORT_TIME");
    });
}

function sdk_search(params) {
    let ret_arr = [];
    return new Promise(function (resolve, reject) {
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
