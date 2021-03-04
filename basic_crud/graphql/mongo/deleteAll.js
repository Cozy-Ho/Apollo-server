import { movieSchema } from "../../models/movies.js";
import mongoose from "mongoose";

export default async function deleteAll(tableName) {
    let Movie = mongoose.model(tableName, movieSchema);
    try {
        await Movie.remove({});
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}
