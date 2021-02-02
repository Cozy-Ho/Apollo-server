import Movie from "../models/movies";
import { v4 as uuidv4 } from "uuid";

async function insertTestDB() {
  try {
    let item_arr = [];
    for (let i = 0; i < 10000; i++) {
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
    await Movie.insertMany(item_arr);

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function getMovie(id) {
  try {
    let movies;
    movies = await Movie.findOne({ id: id });
    return movies;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function searchMovie(args) {
  let query = Movie.find();
  let movies;
  try {
    if (args.search) {
      let search = [];
      for (var i in args.search) {
        if (i != "andor") {
          if (i != "info") {
            console.log("!!");
            search.push({ [i]: args.search[i] });
          } else {
            console.log(args.search[i]);
            let info = JSON.parse(JSON.stringify(args.search[i]));
            search.push({ info });
            console.log(search);
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
    return movies;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function updateMovie(args) {
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

async function removeMovie(id) {
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

async function createMovie(args) {
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
async function deleteAll() {
  try {
    await Movie.remove({});
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

module.exports = {
  getMovie,
  searchMovie,
  createMovie,
  removeMovie,
  updateMovie,
  insertTestDB,
  deleteAll,
};
