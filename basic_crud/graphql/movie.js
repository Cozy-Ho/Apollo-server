import Movie from "../models/movies";
import { v4 as uuidv4 } from "uuid";

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

async function getMovie(
  title = null,
  curpage = null,
  perpage = null,
  orderby = null
) {
  try {
    let movies;
    if (title) {
      movies = await Movie.find({ title: title });
    } else if (orderby) {
      movies = await Movie.find({}).sort(orderby);
    } else if (curpage != null && perpage != null) {
      movies = await Movie.find({})
        .limit(perpage)
        .skip(perpage * (curpage - 1));
    } else {
      movies = await Movie.find({});
    }
    return movies;
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
    return "삭제 완료";
  } catch (err) {
    console.log(err);
    return "삭제 실패";
  }
}

async function addMovie(title, score) {
  try {
    const addedMovie = await Movie.create({
      id: uuidv4(),
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
  getMovie,
  addMovie,
  deleteMovie,
  updateMovie,
  insertTestDB,
  deleteAll,
};
