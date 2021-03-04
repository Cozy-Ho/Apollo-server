import AWS from "aws-sdk";

AWS.config.update({ region: "ap-northeast-2" });
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2021-01-18" });

function search(params) {
    let ret_arr = [];
    return new Promise(function (resolve, reject) {
        console.log(params);
        let flag;
        docClient.query(params, async function (err, data) {
            if (err) {
                console.log(err);
                return reject(err);
            } else {
                let key = data.LastEvaluatedKey;
                ret_arr.push(data.Items);
                if (key) {
                    params.ExclusiveStartKey = key;
                    let data = await search(params, processRemainItemsCallback);
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
async function processRemainItemsCallback(err, data) {
    if (err) {
        console.log("ERR >>> ", err);
    } else {
        var params = {};
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        console.log("getMoreITEMS >>> ", data);
        if (Object.keys(params.ExclusiveStartKey).length != 0) {
            await sleep(500);
            let data = await docClient.query(params, processItemsCallback);
            return data.Items;
        }
    }
}

export default async function searchMovie(args, tablename) {
    let params = {
        TableName: tablename,
    };
    return new Promise(function (resolve, reject) {
        params.ExpressionAttributeValues = {
            ":z": 1,
        };
        params.KeyConditionExpression = "dumy= :z ";
        if (args.search) {
            // 1. search
            let key = Object.getOwnPropertyNames(args.search);
            // and,or 검색 조건부
            let filter = [];
            if (key.includes("title")) {
                params.ExpressionAttributeValues[":t"] = args.search["title"];
                filter.push("s_title=:t");
            }
            if (key.includes("score")) {
                params.ExpressionAttributeValues[":s"] = args.search["score"];
                filter.push("s_score=:s");
            }
            if (key.includes("desc")) {
                params.ExpressionAttributeValues[":d"] = args.search["desc"];
                // DB reserved name 사용
                params.ExpressionAttributeNames = {
                    "#desc": "s_desc",
                };
                filter.push("#desc=:d");
            }
            if (key.includes("watched")) {
                params.ExpressionAttributeValues[":w"] = args.search["watched"];
                filter.push("watched=:w");
            }
            if (key.includes("info")) {
                let info_key = Object.getOwnPropertyNames(args.search["info"]);
                console.log(info_key);
                if (info_key.includes("lang")) {
                    params.ExpressionAttributeValues[":l"] = args.search["info"].lang;
                    filter.push("info.lang=:l");
                }
                if (info_key.includes("subtitle")) {
                    params.ExpressionAttributeValues[":sub"] = args.search["info"].subtitle;
                    filter.push("info.subtitle=:sub");
                }
                if (info_key.includes("dubbing")) {
                    params.ExpressionAttributeValues[":dub"] = args.search["info"].dubbing;
                    filter.push("info.dubbing=:dub");
                }
            }

            // AND or OR search
            if (args.search.andor == "and" || args.search.andor == null) {
                params.FilterExpression = filter.join(" and ");
            } else if (args.search.andor == "or") {
                params.FilterExpression = filter.join(" or ");
            }
        }
        if (args.orderby) {
            // order
            let key = Object.getOwnPropertyNames(args.orderby);
            let order = args.orderby[key[0]];
            key = key[0];

            // Sort- key 설정
            if (key != "id") {
                params.IndexName = key + "-index";
            }
            if (order == "asc") {
                params.ScanIndexForward = true;
            } else {
                params.ScanIndexForward = false;
            }
        }
        if (args.pagination) {
            search(params)
                .then((movies) => {
                    console.log(movies.length, "개 검색완료.");
                    const result = page(movies, args.pagination);
                    return resolve(result);
                })
                .catch((err) => {
                    return reject(err);
                });
        }
        search(params)
            .then((data) => {
                console.log(data.length, "개 검색 완료.");
                return resolve(data);
            })
            .catch((err) => {
                return reject(err);
            });
    });
}
