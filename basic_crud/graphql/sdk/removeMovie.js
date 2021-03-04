import AWS from "aws-sdk";

AWS.config.update({ region: "ap-northeast-2" });
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2021-01-18" });

export default async function removeMovie(id, tablename) {
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
