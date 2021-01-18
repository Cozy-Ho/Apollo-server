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

  let offset = (curpage - 1) * perpage;
  // console.log(movie_arry);
  if (curpage <= max / perpage) {
    movies = movie_arr.slice(offset, offset + perpage);
  } else {
    movies = null;
  }
  return movies;
}

async function insertTestDB() {
  try {
    await Movie.insertMany([
      {
        id: uuidv4(),
        title: "test1",
        score: 1,
      },
      {
        id: uuidv4(),
        title: "test2",
        score: 2,
      },
      {
        id: uuidv4(),
        title: "test3",
        score: 3,
      },
      {
        id: uuidv4(),
        title: "test4",
        score: 54,
      },
      {
        id: uuidv4(),
        title: "jan",
        score: 40,
      },
      {
        id: uuidv4(),
        title: "fev",
        score: 71,
      },
      {
        id: uuidv4(),
        title: "dev",
        score: 90,
      },
      {
        id: uuidv4(),
        title: "feba",
        score: 39,
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
      movies = await Movie.find(args.search);

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
  console.log(origin);
  const update_query = {
    title: args.title || origin.titile,
    score: args.score || origin.score,
    desc: args.desc || origin.desc,
    watched: args.watched || origin.watched,
    info: args.info || origin.info,
  };
  try {
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
    const info = args.info;
    console.log(info);
    const movie = await Movie.create({
      id: uuidv4(),
      title: args.title,
      desc: args.desc || "",
      score: args.score || 0,
      watched: args.watched || false,
      info: info,
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
