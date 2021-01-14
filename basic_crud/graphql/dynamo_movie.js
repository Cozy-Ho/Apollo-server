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
      // 정렬 방법 찾아내기.
      if (order == "asc") {
        movies = await Movie.query(key[0]).eq(key[0]).sort("ascending").exec();
        // console.log(movies);
      } else if (order == "desc") {
        movies = await Movie.query("id").not("").sort("ascending").exec();
      } else {
        movies = null;
      }
    } else if (curpage != null && perpage != null) {
      // todo
      if (curpage != 1) {
        const last = await Movie.scan()
          .limit(perpage * (curpage - 1))
          .exec();
        console.log(last.lastKey);
        const lastkey = last.lastKey;
        if (lastkey) {
          movies = await Movie.scan().startAt(lastkey).limit(perpage).exec();
        } else {
          movies = null;
        }
        // 1페이지 일 경우.
      } else {
        movies = await Movie.scan().limit(perpage).exec();
      }
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
  getMovie,
  addMovie,
  deleteMovie,
  updateMovie,
};
