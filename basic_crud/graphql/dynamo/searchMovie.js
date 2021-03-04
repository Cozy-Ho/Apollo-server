import { movieSchema } from "../../models/dynamo_movies.js";
import dynamoose from "dynamoose";

export default async function searchMovie(args, tableName) {
    let Movie = dynamoose.model(tableName, movieSchema);
    try {
        let movies;
        movies = await Movie.query("dumy").eq(1);
        // SEARCH
        if (args.search) {
            let key = Object.getOwnPropertyNames(args.search);
            console.log(key);

            if (args.search.andor == "and" || args.search.andor == null) {
                if (key.includes("title")) {
                    movies = movies.and().where("title").eq(args.search.title);
                }
                if (key.includes("score")) {
                    movies = movies.and().where("score").eq(args.search.score);
                }
                if (key.includes("desc")) {
                    movies = movies.and().where("desc").eq(args.search.desc);
                }
                if (key.includes("watched")) {
                    movies = movies.and().where("watched").eq(args.search.watched);
                }
                if (key.includes("info")) {
                    let info_key = Object.getOwnPropertyNames(args.search["info"]);
                    console.log(info_key);
                    if (info_key.includes("lang")) {
                        movies = movies.and().where("info.lang").eq(args.search.info.lang);
                    }
                    if (info_key.includes("subtitle")) {
                        movies = movies.and().where("info.subtitle").eq(args.search.info.subtitle);
                    }
                    if (info_key.includes("dubbing")) {
                        movies = movies.and().where("info.dubbing").eq(args.search.info.dubbing);
                    }
                }
            } else if (args.search.andor == "or") {
                movies = movies.and().parenthesis((condition) => {
                    if (key.includes("title")) {
                        condition = condition.or().where("s_title").eq(args.search.title);
                    }
                    if (key.includes("score")) {
                        condition = condition.or().where("s_score").eq(args.search.score);
                    }
                    if (key.includes("desc")) {
                        condition = condition.or().where("s_desc").eq(args.search.desc);
                    }
                    if (key.includes("watched")) {
                        condition = condition.or().where("watched").eq(args.search.watched);
                    }
                    if (key.includes("info")) {
                        let info_key = Object.getOwnPropertyNames(args.search["info"]);
                        console.log(info_key);
                        if (info_key.includes("lang")) {
                            condition = condition.or().where("info.lang").eq(args.search.info.lang);
                        }
                        if (info_key.includes("subtitle")) {
                            condition = condition
                                .or()
                                .where("info.subtitle")
                                .eq(args.search.info.subtitle);
                        }
                        if (info_key.includes("dubbing")) {
                            condition = condition
                                .or()
                                .where("info.dubbing")
                                .eq(args.search.info.dubbing);
                        }
                    }
                    return condition;
                });
            }
        }

        // SORT
        if (args.orderby) {
            let key = Object.getOwnPropertyNames(args.orderby);
            let order = args.orderby[key[0]];
            let index;
            if (key[0] == "id") {
                index = "id";
                if (order == "asc") {
                    movies = movies.sort("acending");
                } else {
                    movies = movies.sort("descending");
                }
            } else {
                index = key[0] + "-index";
                if (order == "asc") {
                    movies = movies.using(index).sort("acending");
                } else {
                    movies = movies.using(index).sort("descending");
                }
            }
        }

        movies = await movies.exec();

        // PAGINATION
        if (args.pagination) {
            movies = page(movies, args.pagination);
        }
        console.log(movies);
        return movies;
    } catch (err) {
        console.log(err);
    }
}
