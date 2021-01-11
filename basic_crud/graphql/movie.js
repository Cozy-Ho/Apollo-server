import Movie from "../models/movies";

async function insertTestDB() {
  try {
    await Movie.insertMany([
      {
        title: "test1",
        score: 1,
      },
      {
        title: "test2",
        score: 2,
      },
      {
        title: "test3",
        score: 3,
      },
      {
        title: "test4",
        score: 54,
      },
      {
        title: "jan",
        score: 40,
      },
      {
        title: "fev",
        score: 71,
      },
      {
        title: "dev",
        score: 90,
      },
      {
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

async function getMovies() {
  try {
    const movies = await Movie.find({});
    return movies;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getByTitle(title) {
  try {
    const finded_movie = await Movie.findOne({ title: title });
    return finded_movie;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function updateMovie(title, score) {
  // Todo. ID 값 추가해서 쉽게 가도록 고치자.
  try {
    const updated_movie = await Movie.findOneAndUpdate(
      {
        title: title,
      },
      {
        score: score,
      }
    );
    return updated_movie;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function deleteMovie(title) {
  try {
    const movie = await Movie.findOneAndDelete({
      title: title,
    });
    console.log(movie);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function addMovie(title, score) {
  try {
    const addedMovie = await Movie.create({
      title: title,
      score: score,
    });
    return addedMovie;
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
  getMovies,
  getByTitle,
  addMovie,
  deleteMovie,
  updateMovie,
  insertTestDB,
  deleteAll,
};
