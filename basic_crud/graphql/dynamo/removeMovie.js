import { movieSchema } from "../../models/dynamo_movies.js";
import dynamoose from "dynamoose";

// TODO: partition-key 5000개로 늘어남..! 수정 필요
export default async function removeMovie(id, tableName) {
    let Movie = dynamoose.model(tableName, movieSchema);
    try {
        await Movie.delete({ dumy: 1, id: id });
        return "삭제 완료";
    } catch (err) {
        console.log(err);
        return "삭제 실패! 에러가 발생했습니다.";
    }
}
