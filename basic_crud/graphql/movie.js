import Movie from "../models/movies";

function insertTestDB() {
  Movie.insertMany([
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
  ])
    .then((res) => {
      console.log(res);
      return true;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}

function getMovies() {
  try {
    const movies = Movie.find({});
    return movies;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

function getByTitle(title) {
  try {
    const finded_movie = Movie.findOne({ title: title }).exec();
    return finded_movie;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

function updateMovie(title, score = null, update_title = null) {
  Movie.findOne(
    {
      title: title,
    },
    function (err, movie) {
      if (err) {
        console.log(err);
        return false;
      }
      if (score != null && update_title != null) {
        movie.title = update_title;
        movie.score = score;
        movie.save();
      } else if (score == null && update_title != null) {
        movie.title = update_title;
        movie.save();
      } else if (score != null && update_title == null) {
        movie.score = score;
        movie.save();
      }
      return true;
    }
  );
}

function deleteMovie(title) {
  Movie.findOneAndDelete(
    {
      title: title,
    },
    function (err, movie) {
      if (err) {
        console.log(err);
        return false;
      }
      console.log(movie);
      return true;
    }
  );
}

function addMovie(title, score) {
  try {
    const addedMovie = Movie.create({
      title: title,
      score: score,
    });
    return addedMovie;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
function deleteAll() {
  Movie.remove({})
    .then((res) => {
      console.log(res);
      return true;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
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
