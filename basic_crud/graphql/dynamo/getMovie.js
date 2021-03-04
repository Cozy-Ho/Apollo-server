import { movieSchema } from "../../models/dynamo_movies.js";
import dynamoose from "dynamoose";

export default async function getMovie(id, tableName) {
    let Movie = dynamoose.model(tableName, movieSchema);
    let movies;
    try {
        movies = await Movie.get({ dumy: 1, id: id });
        console.log(movies);
        return movies;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
