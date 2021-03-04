import AWS from "aws-sdk";

AWS.config.update({ region: "ap-northeast-2" });
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2021-01-18" });

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

export default async function deleteAll(tablename) {
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
