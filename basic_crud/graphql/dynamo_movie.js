import Movie from "../models/dynamo_movies";
import { v4 as uuidv4 } from "uuid";

function order(movies, orderby) {
  // order
  let movie_arr = movies.toJSON();
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

  if (movies.hasOwnProperty("toJSON")) {
    movie_arr = movies.toJSON();
    max = movies.count;
  } else {
    // json으로 변경되어 들어올 경우, movie_arr에 count속성이 없다..
    // 이거때문에 하루 날린듯? 잘하자!
    movie_arr = movies;
    max = movies.length;
  }
  console.log(movie_arr);

  let offset = (curpage - 1) * perpage;
  // console.log(movie_arry);
  if (curpage <= max / perpage || 1 > max / perpage) {
    movies = movie_arr.slice(offset, offset + perpage);
  } else {
    movies = null;
  }
  return movies;
}
// title, score, watched, desc, orderby, curpage, perpage, err
async function searchMovie(args) {
  let params = args;

  try {
    let movies;
    if (params.search) {
      // 1. search
      movies = await Movie.scan(params.search).exec();

      // 2. search + sort + page
      if (params.orderby != null && params.pagination != null) {
        movies = await order(movies, params.orderby);

        movies = await page(movies, params.pagination);
      } else if (params.orderby) {
        // 3. search + sort
        movies = await order(movies, params.orderby);
      } else if (params.pagination) {
        // 4. search + page
        movies = await page(movies, params.pagination);
      }
    } else if (params.orderby) {
      // 5. sort
      movies = await Movie.scan({}).exec();
      movies = order(movies, params.orderby);
      // 6. sort + page
      if (params.pagination) {
        movies = page(movies, params.pagination);
      }
    } else if (params.pagination) {
      // 7. page
      movies = await Movie.scan({}).exec();
      movies = page(movies, params.pagination);
    } else {
      movies = await Movie.scan({}).exec();
      console.log(movies);
    }
    return movies;
  } catch (err) {
    console.log(err);
  }
}

async function getMovie(id) {
  console.log(id);
  let movies;
  try {
    movies = await Movie.get({ id: id });
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
    await Movie.delete({ id: id });
    return "삭제 완료";
  } catch (err) {
    console.log(err);
    return "삭제 실패! 에러가 발생했습니다.";
  }
}

async function updateMovie(args) {
  const origin = await Movie.get({ id: args.id });
  console.log(origin);
  const update_query = {
    title: args.title || origin.title,
    score: args.score || origin.score,
    desc: args.desc || origin.desc,
    watched: args.watched || origin.watched,
    info: args.info || origin.info,
  };
  try {
    const result = await Movie.update({ id: args.id }, update_query);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  getMovie,
  searchMovie,
  createMovie,
  removeMovie,
  updateMovie,
};
