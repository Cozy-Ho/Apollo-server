var AWS = require("aws-sdk");
import { v4 as uuidv4 } from "uuid";

AWS.config.update({ region: "ap-northeast-2" });
// var ddb = new AWS.DynamoDB({ apiVersion: "2021-01-18" });
// Create DynamoDB document client
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2021-01-18" });
var ddb = new AWS.DynamoDB({ apiVersion: "2021-01-18" });

let tablename = "test02-movie5";

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

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

function page(movies, pagination) {
    // console.log(movies);
    const curpage = pagination.curpage;
    const perpage = pagination.perpage;
    let movie_arr = movies;
    let max = movie_arr.length;
    let ret;
    let tot_page;
    if (max % perpage != 0) {
        tot_page = parseInt(max / perpage) + 1;
    } else {
        tot_page = max / perpage;
    }

    let offset = (curpage - 1) * perpage;
    // console.log(movie_arry);
    if (curpage <= tot_page) {
        ret = movie_arr.slice(offset, offset + perpage);
    } else {
        ret = [];
    }
    return ret;
}

function setTableName(tName) {
    tablename = tName;
}

async function createTable(args) {
    let params = {
        AttributeDefinitions: [
            {
                AttributeName: "dumy",
                AttributeType: "N",
            },
            {
                AttributeName: "id",
                AttributeType: "S",
            },
            {
                AttributeName: "title",
                AttributeType: "S",
            },
            {
                AttributeName: "score",
                AttributeType: "N",
            },
            {
                AttributeName: "desc",
                AttributeType: "S",
            },
        ],
        KeySchema: [
            {
                AttributeName: "dumy",
                KeyType: "HASH",
            },
            {
                AttributeName: "id",
                KeyType: "RANGE",
            },
        ],
        BillingMode: "PAY_PER_REQUEST",
        LocalSecondaryIndexes: [
            {
                IndexName: "title-index",
                KeySchema: [
                    {
                        AttributeName: "dumy",
                        KeyType: "HASH",
                    },
                    {
                        AttributeName: "title",
                        KeyType: "RANGE",
                    },
                ],
                Projection: {
                    ProjectionType: "ALL",
                },
            },
            {
                IndexName: "score-index",
                KeySchema: [
                    {
                        AttributeName: "dumy",
                        KeyType: "HASH",
                    },
                    {
                        AttributeName: "score",
                        KeyType: "RANGE",
                    },
                ],
                Projection: {
                    ProjectionType: "ALL",
                },
            },
            {
                IndexName: "desc-index",
                KeySchema: [
                    {
                        AttributeName: "dumy",
                        KeyType: "HASH",
                    },
                    {
                        AttributeName: "desc",
                        KeyType: "RANGE",
                    },
                ],
                Projection: {
                    ProjectionType: "ALL",
                },
            },
        ],
        TableName: args.tableName,
        StreamSpecification: {
            StreamEnabled: false,
        },
    };
    await ddb.createTable(params, function (err, data) {
        if (err) {
            console.log("error", err);
            return false;
        } else {
            console.log("Table Created!", data);
            setTableName(args.tableName);
            let table_param = { TableName: args.tableName };
            console.log("WAITING>>>");
            ddb.waitFor("tableExists", table_param, function (err, data) {
                if (err) console.log(err, err.stack);
                else {
                    console.log("CREATED>>>");
                    return true;
                }
            });
        }
    });
}

async function searchMovie(args) {
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

async function getMovie(id) {
    let params = {
        TableName: tablename,
    };
    return new Promise(function (resolve, reject) {
        console.log(params);
        params.ExpressionAttributeValues = {
            ":z": 1,
            ":i": id,
        };
        params.KeyConditionExpression = "dumy = :z and id = :i";
        // params.FilterExpression = { id: id };
        docClient.query(params, function (err, data) {
            if (err) {
                console.log("Error", err);
                return reject(err);
            } else {
                console.log("Success", data.Items);
                return resolve(data.Items[0]);
            }
        });
    });
}

async function createMovie(args) {
    let params = {
        TableName: tablename,
    };
    return new Promise(function (resolve, reject) {
        params.Item = {
            dumy: 1,
            id: uuidv4(),
            title: args.title,
            desc: args.desc || "",
            score: args.score || 0,
            watched: args.watched || false,
            info: args.info,
            s_title: args.title,
            s_desc: args.desc || "",
            s_score: args.score || 0,
        };
        console.log(params.Item);
        docClient.put(params, function (err, data) {
            if (err) {
                console.log("Error", err);
                return reject(err);
            } else {
                console.log("Success", data);
                return resolve(params.Item);
            }
        });
    });
}

async function updateMovie(args) {
    let params = {
        TableName: tablename,
    };
    return new Promise(function (resolve, reject) {
        getMovie(args.id).then((origin) => {
            if (!args.title) {
                args.title = origin.title;
            }
            let watched;
            if (origin.watched != null) {
                if (args.watched != null) {
                    watched = args.watched;
                } else {
                    watched = origin.watched;
                }
            } else {
                if (args.watched != null) {
                    watched = args.watched;
                } else {
                    watched = false;
                }
            }
            params.Key = { id: args.id, dumy: 1 };
            params.UpdateExpression =
                "SET #title = :t, #score = :s, #watched = :w, #desc=:d, #info=:i, s_title=:t,s_score=:s,s_desc=:d ";
            params.ExpressionAttributeNames = {
                "#title": "title",
                "#desc": "desc",
                "#score": "score",
                "#watched": "watched",
                "#info": "info",
            };
            params.ExpressionAttributeValues = {
                ":t": args.title,
                ":d": args.desc || origin.desc || "",
                ":s": args.score || origin.score || 0,
                ":w": watched,
                ":i": args.info || origin.info,
            };
            console.log(params);
            docClient.update(params, function (err, data) {
                if (err) {
                    console.log("Error", err);
                    return reject(err);
                } else {
                    console.log("Success", data.Item);
                    return resolve(args);
                }
            });
        });
    });
}

async function removeMovie(id) {
    let params = {
        TableName: tablename,
    };
    return new Promise(function (resolve, reject) {
        params.Key = { dumy: 1, id: id };

        docClient.delete(params, function (err, data) {
            if (err) {
                console.log("Error", err);
                reject("삭제 실패!");
            } else {
                console.log("Success", data);
                resolve("삭제완료");
            }
        });
    });
}

async function deleteAll() {
    let params = {
        TableName: tablename,
    };
    params.ExpressionAttributeValues = {
        ":z": 1,
    };
    params.KeyConditionExpression = "dumy= :z ";
    params.ProjectionExpression = "dumy, id";
    let ids = await search(params);
    console.log(ids.length + "개 검색 완료");
    // ids = ids.Items;
    let item_arr = [];
    try {
        for (let i = 0; i < ids.length; i++) {
            item_arr.push({
                DeleteRequest: {
                    Key: {
                        dumy: 1,
                        id: ids[i].id,
                    },
                },
            });
        }
        // console.log(item_arr);
        for (let j = 0; j < item_arr.length / 25 + 1; j++) {
            let begin = j * 25;
            let end = begin + 25;
            if (!item_arr[begin]) break;
            if (j % 12 == 0) {
                await sleep(5000);
            }
            let new_params = {
                RequestItems: {
                    [tablename]: item_arr.slice(begin, end),
                },
            };
            docClient.batchWrite(new_params, async function (err, data) {
                if (err) {
                    console.log("error", err);
                    return false;
                } else {
                    let params = {};
                    params.RequestItems = data.UnprocessedItems;
                    console.log("DELETED >>>" + j, data);
                    if (Object.keys(params.RequestItems).length != 0) {
                        await sleep(500);
                        docClient.batchWrite(params, processItemsCallback);
                    }
                    return true;
                }
            });
        }
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function insertTestDB(args) {
    if (args.new) {
        return await createTable(args);
    }
    let item_arr = [];

    // A single call to BatchWriteItem can write up to 16 MB of data,
    // which can comprise as many as 25 put or delete requests.
    // Individual items to be written can be as large as 400 KB.
    // BatchWriteItem cannot update items
    try {
        for (let i = 0; i < 1000000; i++) {
            let ti = Math.random().toString(36).substring(7);
            let des = Math.random().toString(36).substring(7);
            let sco = Math.floor(Math.random() * 99 + 1);
            let wat = (Math.random() * 10) % 2 == 0 ? true : false;
            let inf =
                (Math.random() * 10) % 6 == 0
                    ? { lang: "eng", subtitle: "kor" }
                    : (Math.random() * 10) % 2 == 0
                    ? { lang: "kor", dubbing: "eng" }
                    : { lang: "eng", dubbing: "jap" };
            item_arr.push({
                PutRequest: {
                    Item: {
                        dumy: 1,
                        id: uuidv4(),
                        title: ti,
                        score: sco,
                        desc: des,
                        s_title: ti,
                        s_score: sco,
                        s_desc: des,
                        watched: wat,
                        info: inf,
                    },
                },
            });
        }
        for (let i = 0; i < item_arr.length / 25 + 1; i++) {
            let begin = i * 25;
            let end = begin + 25;
            if (!item_arr[begin]) break;
            let input_arr = item_arr.slice(begin, end);
            let params = {
                RequestItems: {
                    [tablename]: input_arr,
                },
            };
            // 쓰로틀링 방지용 300개당 5초씩
            if (i % 5 == 0) {
                await sleep(3000);
            }
            docClient.batchWrite(params, async function (err, data) {
                if (err) {
                    console.log("error", err);
                    return false;
                } else {
                    let params = {};
                    params.RequestItems = data.UnprocessedItems;
                    console.log("success>>>" + i, data);
                    if (Object.keys(params.RequestItems).length != 0) {
                        await sleep(500);
                        docClient.batchWrite(params, processItemsCallback);
                    }
                    return true;
                }
            });
        }

        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}
async function processItemsCallback(err, data) {
    if (err) {
        console.log("ERR >>> ", err);
    } else {
        var params = {};
        params.RequestItems = data.UnprocessedItems;
        console.log("unProcessedItem >>> ", data);
        if (Object.keys(params.RequestItems).length != 0) {
            await sleep(500);
            docClient.batchWrite(params, processItemsCallback);
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
            await sleep(500);
            let data = await docClient.query(params, processItemsCallback);
            return data.Items;
        }
    }
}

module.exports = {
    getMovie,
    searchMovie,
    createMovie,
    removeMovie,
    updateMovie,
    insertTestDB,
    deleteAll,
    createTable,
};
