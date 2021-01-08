import {
  getMovies,
  getByTitle,
  addMovie,
  deleteMovie,
  updateMovie,
  insertTestDB,
  deleteAll,
} from "./movie";

const resolvers = {
  Query: {
    movies: () => getMovies(),
    movie: (_, { title }) => getByTitle(title),
    insertTestDB: () => insertTestDB(),
    deleteAll: () => deleteAll(),
  },
  Mutation: {
    addMovie: (_, { title, score }) => addMovie(title, score),
    deleteMovie: (_, { title }) => deleteMovie(title),
    updateMovie: (_, { title, score, update_title }) =>
      updateMovie(title, score, update_title),
  },
};
export default resolvers;
