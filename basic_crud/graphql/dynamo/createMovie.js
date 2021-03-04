import { movieSchema } from "../../models/dynamo_movies.js";
import dynamoose from "dynamoose";
import { v4 as uuidv4 } from "uuid";

export default async function createMovie(args, tableName) {
    let Movie = dynamoose.model(tableName, movieSchema);
    const info = args.info;
    let param = {
        dumy: 1,
        id: uuidv4(),
        title: args.title,
        desc: args.desc || "",
        score: args.score || 0,
        watched: args.watched || false,
        s_title: args.title,
        s_desc: args.desc || "",
        s_score: args.score || 0,
        info: info,
    };

    try {
        const result = await Movie.create(param);
        console.log(result);

        return result;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
