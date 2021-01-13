import Movie from "../models/dynamo_movies";
import { v4 as uuidv4 } from "uuid";

async function getMovie(
  title = null,
  curpage = null,
  perpage = null,
  orderby = null
) {
  try {
    let movies;
    if (title) {
      movies = await Movie.scan({ title: title }).exec();
    } else if (orderby) {
      let key = Object.getOwnPropertyNames(orderby);
      let order = orderby[key[0]];
      console.log(key, order);

      // todo
      if (order == "asc") {
        movies = await Movie.query(key[0]).eq(key[0]).sort("ascending").exec();
        // console.log(movies);
      } else if (order == "desc") {
        // movies = await Movie.scan().exec().sort("descending").exec();
      } else {
        movies = null;
      }
    } else if (curpage != null && perpage != null) {
      //   todo
      movies = await Movie.scan().limit(perpage).exec();
    } else {
      movies = await Movie.scan().exec();
    }
    return movies;
  } catch (err) {
    console.log(err);
  }
}

async function addMovie(title, score) {
  const result = new Movie({
    id: uuidv4(),
    title: title,
    score: score,
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
    const exist = await Movie.scan({ title: title }).exec();
    // console.log(result);
    if (exist != null) {
      const id = exist.toJSON()[0].id;
      await Movie.delete({ id: id });
      return true;
    } else {
      throw err;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

// title 없는 내용 update 시 예외처리 추가할것.
async function updateMovie(title, score) {
  try {
    const exist = await Movie.scan({ title: title }).exec();
    // console.log(exist);
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
  getMovie,
  addMovie,
  deleteMovie,
  updateMovie,
};
