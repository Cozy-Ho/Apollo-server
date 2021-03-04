import { movieSchema } from "../../models/dynamo_movies.js";
import dynamoose from "dynamoose";

// TODO: partition-key 5000개로 늘어남.. 수정 필요
export default async function updateMovie(args, tableName) {
    let Movie = dynamoose.model(tableName, movieSchema);
    const origin = await Movie.get({ dumy: 1, id: args.id });
    console.log(origin);
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
    const update_query = {
        title: args.title || origin.title,
        score: args.score || origin.score,
        desc: args.desc || origin.desc,
        watched: watched,
        info: args.info || origin.info || {},
        s_title: args.title || origin.title,
        s_score: args.score || origin.score,
        s_desc: args.desc || origin.desc,
    };
    try {
        const result = await Movie.update({ dumy: 1, id: args.id }, update_query);
        console.log(result);
        return result;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
