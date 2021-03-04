import { movieSchema } from "../../models/movies.js";
import mongoose from "mongoose";

export default async function updateMovie(args, tableName) {
    let Movie = mongoose.model(tableName, movieSchema);
    const origin = await Movie.findOne({ id: args.id });
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
    };
    try {
        console.log(update_query);
        const movie = await Movie.findOneAndUpdate(
            {
                id: args.id,
            },
            update_query
        );
        console.log(movie);
        return movie;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
