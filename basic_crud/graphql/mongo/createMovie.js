import { movieSchema } from "../../models/movies.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export default async function createMovie(args) {
    let Movie = mongoose.model(args.tableName, movieSchema);
    try {
        const movie = await Movie.create({
            dumy: 1,
            id: uuidv4(),
            title: args.title,
            desc: args.desc || "",
            score: args.score || 0,
            watched: args.watched || false,
            info: args.info,
        });
        console.log(movie);
        return movie;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
