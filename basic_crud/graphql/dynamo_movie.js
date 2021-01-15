import Movie from "../models/dynamo_movies";
import { v4 as uuidv4 } from "uuid";

function order(movies, orderby) {
  // order
  let movie_arr = movies.toJSON();
  let key = Object.getOwnPropertyNames(orderby);
  let order = orderby[key[0]];
  key = key[0];
  console.log(key, order);
  if (order == "asc") {
    movies = movie_arr.sort((a, b) => (a[key] > b[key] ? 1 : -1));
  } else {
    movies = movie_arr.sort((a, b) => (a[key] > b[key] ? -1 : 1));
  }

  return movies;
}

function page(movies, curpage, perpage) {
  // console.log(movies);
  const max = movies.count;
  let movie_arr;
  console.log(movies);

  if (typeof movies == "object") {
    movie_arr = movies.toJSON();
  } else {
    movie_arr = movies;
  }
  let offset = (curpage - 1) * perpage;
  // console.log(movie_arry);
  if (curpage <= max / perpage) {
    movies = movie_arr.slice(offset, offset + perpage);
  } else {
    movies = null;
  }
  return movies;
}

async function searchMovie(
  title = null,
  score = null,
  watched = null,
  orderby = null,
  curpage = null,
  perpage = null,
  err = null
) {
  try {
    let movies;
    if (title != null || score != null || watched != null) {
      // search
      if (title) {
        movies = await Movie.scan({ title: title }).exec();
      } else if (score) {
        movies = await Movie.scan({ score: score }).exec();
      } else {
        movies = await Movie.scan({ watched: watched }).exec();
      }
      // search + sort + page
      if (orderby != null && curpage != null && perpage != null) {
        movies = await order(movies, orderby);
        console.log("PASS");
        movies = page(movies, curpage, perpage);
      }
      // search + sort
      if (orderby != null && curpage != null && perpage != null) {
        movies = await order(movies, orderby);
      }
    } else if (orderby) {
      // sort
      movies = await Movie.scan({}).exec();
      movies = order(movies, orderby);
    } else if (curpage != null && perpage != null) {
      // page
      movies = await Movie.scan({}).exec();
      movies = page(movies, curpage, perpage);
    } else {
      movies = await Movie.scan({}).exec();
    }
    return movies;
  } catch (err) {
    console.log(err);
  }
}

async function addMovie(title, score = 0, desc = "", watched = false) {
  const result = new Movie({
    id: uuidv4(),
    title: title,
    desc: desc,
    score: score,
    watched: watched,
  });
  try {
    await result.save();
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function deleteMovie(title) {
  try {
    let exist = await Movie.scan({ title: title }).exec();
    if (exist.count != 0) {
      const id = exist.toJSON()[0].id;
      await Movie.delete({ id: id });
      return "삭제 완료";
    } else {
      return "삭제하려는 데이터가 DB에 존재하지 않습니다.";
    }
  } catch (err) {
    console.log(err);
    return "삭제 실패! 에러가 발생했습니다.";
  }
}

async function updateMovie(title, score) {
  try {
    const exist = await Movie.scan({ title: title }).exec();

    if (exist != null) {
      const id = exist.toJSON()[0].id;
      console.log(id);
      const result = await Movie.update({ id: id }, { score: score });
      return result;
    } else {
      throw err;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  searchMovie,
  addMovie,
  deleteMovie,
  updateMovie,
};
