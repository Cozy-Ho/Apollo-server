import Movie from "../models/dynamo_movies";
import { v4 as uuidv4 } from "uuid";

// title, score, watched, desc, orderby, curpage, perpage, err
async function searchMovie(args) {
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
            movies = movies
              .and()
              .where("info.subtitle")
              .eq(args.search.info.subtitle);
          }
          if (info_key.includes("dubbing")) {
            movies = movies
              .and()
              .where("info.dubbing")
              .eq(args.search.info.dubbing);
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
              condition = condition
                .or()
                .where("info.lang")
                .eq(args.search.info.lang);
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

    // PAGINATION
    if (args.pagination) {
      const perpage = args.pagination.perpage;
      const curpage = args.pagination.curpage;
      let limit;
      if (curpage == 1) {
        limit = perpage;
        movies = await movies.limit(limit);
      } else {
        limit = (curpage - 1) * perpage;
        const last = await movies.limit(limit).exec();
        console.log(last);
        movies = movies.limit(perpage).startAt(last.lastKey);
      }
    }
    movies = await movies.exec();
    console.log(movies);
    return movies;
  } catch (err) {
    console.log(err);
  }
}

async function getMovie(id) {
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

async function createMovie(args) {
  const info = args.info;

  try {
    const result = await Movie.create({
      dumy: 1,
      id: uuidv4(),
      title: args.title,
      desc: args.desc || "",
      score: args.score || 0,
      watched: args.watched || false,
      info: info,
    });
    console.log(result);

    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function removeMovie(id) {
  try {
    await Movie.delete({ dumy: 1, id: id });
    return "삭제 완료";
  } catch (err) {
    console.log(err);
    return "삭제 실패! 에러가 발생했습니다.";
  }
}

async function updateMovie(args) {
  const origin = await Movie.get({ dumy: 1, id: args.id });
  console.log(origin);
  const update_query = {
    title: args.title || origin.title,
    score: args.score || origin.score,
    desc: args.desc || origin.desc,
    watched: args.watched || origin.watched,
    info: args.info || origin.info || {},
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

async function insertTestDB() {
  try {
    await Movie.batchPut([
      {
        dumy: 1,
        id: uuidv4(),
        title: "abc",
        score: 1,
        desc: "samsung",
        watched: true,
        info: {
          lang: "eng",
          subtitle: "kor",
        },
        s_title: "abc",
        s_score: 1,
        s_desc: "samsung",
      },
      {
        dumy: 1,
        id: uuidv4(),
        title: "abc",
        score: 2,
        desc: "sample",
        watched: false,
        info: {
          lang: "kor",
          dubbing: "eng",
        },
        s_title: "abc",
        s_score: 2,
        s_desc: "sample",
      },
      {
        dumy: 1,
        id: uuidv4(),
        title: "abc",
        score: 3,
        desc: "test",
        watched: true,
        info: {
          lang: "kor",
          subtitle: "eng",
        },
        s_title: "abc",
        s_score: 3,
        s_desc: "test",
      },
      {
        dumy: 1,
        id: uuidv4(),
        title: "test6",
        score: 54,
        desc: "sample",
        watched: true,
        info: {
          lang: "ger",
          dubbing: "eng",
        },
        s_title: "test6",
        s_score: 54,
        s_desc: "sample",
      },
      {
        dumy: 1,
        id: uuidv4(),
        title: "jan",
        score: 40,
        desc: "jap",
        watched: false,
        info: {
          lang: "eng",
          dubbing: "kor",
        },
        s_title: "jan",
        s_score: 40,
        s_desc: "jap",
      },
      {
        dumy: 1,
        id: uuidv4(),
        title: "vatech",
        score: 999,
        desc: "vatech_test",
        watched: false,
        info: {
          lang: "eng",
          subtitle: "kor",
        },
        s_title: "vatech",
        s_score: 999,
        s_desc: "vatech_test",
      },
    ]);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

module.exports = {
  getMovie,
  insertTestDB,
  searchMovie,
  createMovie,
  removeMovie,
  updateMovie,
};
