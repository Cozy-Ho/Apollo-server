import connect_all from "./models/index.js";

import src from "./src/index.js";

// var ddb = new AWS.DynamoDB({ apiVersion: "2021-01-18", maxRetries: 5 });

connect_all();

src.input.input().then((res) => {
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
            src.mongoose.mongo_export(res, option);
        } else {
            src.mongoose.mongo_import(res);
        }
    } else if (res.db == "dynamo") {
        if (res.command == "export") {
            src.dynamoose.dynamo_export(res, option);
        } else {
            src.dynamoose.dynamo_import(res);
        }
    } else if (res.db == "sdk") {
        if (res.command == "export") {
            src.sdk.sdk_export(res, option);
        } else {
            src.sdk.sdk_import(res);
        }
    }
    if (res.command == "convert") {
        src.convert(res);
    }
});
