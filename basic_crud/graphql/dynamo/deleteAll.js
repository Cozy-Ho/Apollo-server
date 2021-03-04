import { movieSchema } from "../../models/dynamo_movies.js";
import dynamoose from "dynamoose";

/**
 * TODO:
 * partition-key가 5000개로 늘어남. 코드 수정해야함.
 * */
export default async function deleteAll(tableName) {
    let Movie = dynamoose.model(tableName, movieSchema);
    try {
        // 1MB 초과해서 lasykey로 잘리는 부분 해결하기...
        let ret_arr = [];
        let ids = await Movie.query("dumy").eq(1).attributes(["dumy", "id"]).exec();
        ret_arr.push(ids.toJSON());
        let key = ids.lastKey;
        console.log(key);
        let flag;
        ret_arr = ret_arr.flat();
        if (key) {
            flag = true;
        } else {
            flag = false;
        }
        while (flag) {
            let temp = await Movie.query("dumy")
                .eq(1)
                .startAt(key)
                .attributes(["dumy", "id"])
                .exec();
            ret_arr.push(temp.toJSON());
            if (temp.lastKey === undefined) {
                flag != flag;
                break;
            } else {
                key = temp.lastKey;
            }
        }

        console.log(ret_arr.length, "개 데이터를 삭제합니다.");
        for (let i = 0; i < ret_arr.length / 25 + 1; i++) {
            let begin = i * 25;
            let end = begin + 25;
            if (!ret_arr[begin]) break;
            await Movie.batchDelete(ret_arr.slice(begin, end));
            console.log("DELETED>>>" + i);
        }
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}
