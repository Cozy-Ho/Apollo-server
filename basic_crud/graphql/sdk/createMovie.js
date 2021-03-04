import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

AWS.config.update({ region: "ap-northeast-2" });
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2021-01-18" });

export default async function createMovie(args, tablename) {
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
