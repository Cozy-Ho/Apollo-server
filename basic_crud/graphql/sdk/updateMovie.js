import AWS from "aws-sdk";

AWS.config.update({ region: "ap-northeast-2" });
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2021-01-18" });

export default async function updateMovie(args, tablename) {
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
