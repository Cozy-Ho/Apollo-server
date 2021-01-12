import Movie from "../models/dynamo_movies";

async function dynamo_getMovies() {
  try {
    const result = await Movie.scan().exec();
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function dynamo_findMovie(title) {
  try {
    // const result = await Movie.query("title").eq(title).exec();
    const result = await Movie.scan({ title: title }).exec();
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function dynamo_addMovie(title, score) {
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

async function dynamo_deleteMovie(title) {
  try {
    const result = await Movie.get({ title: title });
    console.log(result);
    result.delete();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function dynamo_updateMovie(title, score) {
  try {
    const result = await Movie.get({ title: title });
    result.score = score;
    await result.save();
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  dynamo_getMovies,
  dynamo_addMovie,
  dynamo_findMovie,
  dynamo_deleteMovie,
  dynamo_updateMovie,
};
