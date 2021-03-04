import { movieSchema } from "../../models/movies.js";
import mongoose from "mongoose";

export default async function searchMovie(args, tableName) {
    let Movie = mongoose.model(tableName, movieSchema);
    let query = Movie.find();
    let movies;
    try {
        if (args.search) {
            let search = [];
            for (var i in args.search) {
                if (i != "andor") {
                    if (i != "info") {
                        search.push({ [i]: args.search[i] });
                    } else {
                        let info = JSON.parse(JSON.stringify(args.search[i]));
                        search.push({ info });
                    }
                }
            }
            // AND , OR condition
            if (args.search.andor == "and" || args.search.andor == null) {
                query.and(search);
            } else {
                query.or(search);
            }
        }
        if (args.orderby) {
            let key = Object.getOwnPropertyNames(args.orderby);
            let order = args.orderby[key[0]];
            key = key[0];
            query.sort({ [key]: order });
        }
        if (args.pagination) {
            const curpage = args.pagination.curpage;
            const perpage = args.pagination.perpage;
            query.skip((curpage - 1) * perpage).limit(perpage);
        }
        movies = await query.exec();
        console.log(movies);
        return movies;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
