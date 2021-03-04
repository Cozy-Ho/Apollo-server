import { movieSchema } from "../../models/movies.js";
import mongoose from "mongoose";

export default async function getMovie(id, tableName) {
    let Movie = mongoose.model(tableName, movieSchema);
    try {
        let movies;
        movies = await Movie.findOne({ id: id });
        return movies;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
