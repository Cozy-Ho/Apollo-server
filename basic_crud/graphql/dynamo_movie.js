import Movie from "../models/dynamo_movies";
import { v4 as uuidv4 } from "uuid";

function page(movies, pagination) {
  // console.log(movies);
  const curpage = pagination.curpage;
  const perpage = pagination.perpage;
  let movie_arr = movies.toJSON();
  console.log(movie_arr);
  let max = movie_arr.length;
  let ret;
  let tot_page;
  if (max % perpage != 0) {
    tot_page = parseInt(max / perpage) + 1;
  } else {
    tot_page = max / perpage;
  }

  let offset = (curpage - 1) * perpage;
  // console.log(movie_arry);
  if (curpage <= tot_page) {
    ret = movie_arr.slice(offset, offset + perpage);
  } else {
    ret = [];
  }
  return ret;
}

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
  let param = {
    dumy: 1,
    id: uuidv4(),
    title: args.title,
    desc: args.desc || "",
    score: args.score || 0,
    watched: args.watched || false,
    s_title: args.title,
    s_desc: args.desc || "",
    s_score: args.score || 0,
    info: info,
  };

  try {
    const result = await Movie.create(param);
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

async function deleteAll() {
  try {
    // 1MB 초과해서 lasykey로 잘리는 부분 해결하기...
    let ids = await Movie.query("dumy").eq(1).attributes(["dumy", "id"]).exec();
    ids = ids.toJSON();

    for (let i = 0; i < ids.length / 25 + 1; i++) {
      let begin = i * 25;
      let end = begin + 25;
      if (!ids[begin]) break;
      await Movie.batchDelete(ids.slice(begin, end));
      console.log("DELETED>>>" + i);
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function insertTestDB() {
  let item_arr = [];
  try {
    for (let i = 0; i < 400; i++) {
      for (let j = 0; j < 25; j++) {
        let ti = Math.random().toString(36).substring(7);
        let des = Math.random().toString(36).substring(7);
        let sco = Math.floor(Math.random() * 99 + 1);
        let wat = Math.floor(Math.random() * 10) % 2 == 0 ? true : false;
        let inf =
          Math.floor(Math.random() * 10) % 2 == 0
            ? { lang: "eng", subtitle: "kor" }
            : { lang: "kor", dubbing: "eng" };
        item_arr.push({
          dumy: 1,
          id: uuidv4(),
          title: ti,
          score: sco,
          desc: des,
          s_title: ti,
          s_score: sco,
          s_desc: des,
          watched: wat,
          info: inf,
        });
      }
      // console.log(item_arr);
      await Movie.batchPut(item_arr);
      console.log("INSERT_DONE>>>" + i);
      item_arr = [];
    }
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
  deleteAll,
};
