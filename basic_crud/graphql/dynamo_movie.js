import Movie from "../models/dynamo_movies";

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
        movies = await Movie.scan().exec(function (err, data) {
          if (err) {
            console.log(err);
            throw err;
          }
          data.sort();
          console.log(data);
          return data;
        });
        // movies = await Movie.query("title").eq(key[0]).sort("ascending").exec();
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
    const result = await Movie.get({ title: title });
    console.log(result);
    if (result != null) {
      result.delete();
      return true;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

// title 없는 내용 update 시 예외처리 추가할것.
async function updateMovie(title, score) {
  try {
    const exist = await Movie.get({ title: title });

    if (exist != null) {
      const result = await Movie.update({ title: title }, { score: score });
      return result;
    } else {
      return null;
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
