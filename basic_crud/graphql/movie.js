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

async function updateMovie(title, score = null, update_title = null) {
  // Todo. ID 값 추가해서 쉽게 가도록 고치자.
  //
  // try{
  //   const updateMovie = await Movie.findOneAndUpdate({
  //     title: title,
  //   });
  //   const updatedMovie = await Movie.Update({})
  // }catch(err){
  //   //
  // }
  const updatedMovie = Movie.findOne(
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
      } else {
        return false;
      }
    }
  );
  return updatedMovie;
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
