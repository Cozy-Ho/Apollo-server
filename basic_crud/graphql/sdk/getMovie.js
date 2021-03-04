import AWS from "aws-sdk";

AWS.config.update({ region: "ap-northeast-2" });
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2021-01-18" });

export default async function getMovie(id, tablename) {
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
