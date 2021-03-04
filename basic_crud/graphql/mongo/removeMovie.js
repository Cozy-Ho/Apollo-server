import { movieSchema } from "../../models/movies.js";
import mongoose from "mongoose";

export default async function removeMovie(id, tableName) {
    let Movie = mongoose.model(tableName, movieSchema);
    try {
        const movie = await Movie.findOneAndDelete({
            id: id,
        });
        console.log(movie);
        return "삭제 완료";
    } catch (err) {
        console.log(err);
        return "삭제 실패";
    }
}
