import Movie from "../models/movies";
import { v4 as uuidv4 } from "uuid";

function order(movies, orderby) {
  // order
  let movie_arr = movies;
  let key = Object.getOwnPropertyNames(orderby);
  let order = orderby[key[0]];
  key = key[0];
  if (order == "asc") {
    movies = movie_arr.sort((a, b) => (a[key] > b[key] ? 1 : -1));
  } else {
    movies = movie_arr.sort((a, b) => (a[key] > b[key] ? -1 : 1));
  }
  return movies;
}
function page(movies, pagination) {
  // console.log(movies);
  let max;
  let movie_arr;
  const curpage = pagination.curpage;
  const perpage = pagination.perpage;

  movie_arr = movies;
  max = movies.length;
  console.log(movie_arr);

  let tot_page;
  if (max % perpage != 0) {
    tot_page = parseInt(max / perpage) + 1;
  } else {
    tot_page = max / perpage;
  }
  console.log(movie_arr);

  let offset = (curpage - 1) * perpage;
  // console.log(movie_arry);
  if (curpage <= tot_page) {
    movies = movie_arr.slice(offset, offset + perpage);
  } else {
    movies = [];
  }
  return movies;
}

async function insertTestDB() {
  try {
    await Movie.insertMany([
      {
        dumy: 1,
        id: uuidv4(),
        title: "abc",
        score: 1,
        desc: "",
        watched: true,
        info: {
          lang: "eng",
          subtitle: "kor",
        },
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
      },
    ]);

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
  try {
    let movies;

    if (args.search) {
      // 1. search
      // AND 조건
      if (args.search.andor == "and" || args.search.andor == null) {
        delete args.search["andor"];
        // console.log(args.search);
        movies = await Movie.find(args.search);
        // console.log(movies);

        // OR 조건
      } else {
        let query = [];
        for (var i in args.search) {
          if (i != "andor") {
            query.push({ [i]: args.search[i] });
          }
        }
        movies = await Movie.find({ $or: query });
      }

      // 2. search + sort + page
      if (args.orderby != null && args.pagination != null) {
        movies = order(movies, args.orderby);
        movies = page(movies, args.pagination);
      } else if (args.orderby) {
        // 3. search + sort
        console.log(movies);
        movies = order(movies, args.orderby);
      } else if (args.pagination) {
        // 4. search + page
        movies = page(movies, args.pagination);
      }
    } else if (args.orderby) {
      // 5. sort
      movies = await Movie.find({}).sort(args.orderby);
      // 6. sort + page
      if (args.pagination) {
        movies = page(movies, args.pagination);
      }
    } else if (args.pagination) {
      // 7. page
      movies = await Movie.find({});
      movies = page(movies, args.pagination);
    } else {
      movies = await Movie.find({});
    }
    return movies;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function updateMovie(args) {
  const origin = await Movie.findOne({ id: args.id });

  const update_query = {
    title: args.title || origin.title,
    score: args.score || origin.score,
    desc: args.desc || origin.desc,
    watched: args.watched || origin.watched,
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
