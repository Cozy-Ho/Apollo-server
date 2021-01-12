import {
  getMovies,
  pageMovies,
  getByTitle,
  addMovie,
  deleteMovie,
  updateMovie,
  insertTestDB,
  deleteAll,
} from "./movie";
import {
  dynamo_getMovies,
  dynamo_addMovie,
  dynamo_findMovie,
  dynamo_deleteMovie,
  dynamo_updateMovie,
} from "./dynamo_movie";

const resolvers = {
  Query: {
    movies: (_, { orderby }) => getMovies(orderby),
    movie: (_, { title }) => getByTitle(title),
    pageMovies: (_, { perpage, curpage }) => pageMovies(perpage, curpage),

    // Dynamo_db
    dynamo_getMovies: () => dynamo_getMovies(),
    dynamo_findMovie: (_, { title }) => dynamo_findMovie(title),
  },
  Mutation: {
    addMovie: (_, { title, score }) => addMovie(title, score),
    deleteMovie: (_, { title }) => deleteMovie(title),
    updateMovie: (_, { title, score }) => updateMovie(title, score),
    insertTestDB: () => insertTestDB(),
    deleteAll: () => deleteAll(),

    // Dynamo_db
    dynamo_addMovie: (_, { title, score }) => dynamo_addMovie(title, score),
    dynamo_deleteMovie: (_, { title }) => dynamo_deleteMovie(title),
    dynamo_updateMovie: (_, { title, score }) =>
      dynamo_updateMovie(title, score),
  },
};
export default resolvers;
