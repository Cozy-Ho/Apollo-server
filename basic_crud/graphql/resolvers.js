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
  },
  Mutation: {
    addMovie: (_, { title, score }) => addMovie(title, score),
    deleteMovie: (_, { title }) => deleteMovie(title),
    updateMovie: (_, { title, score, update_title }) =>
      updateMovie(title, score, update_title),
    insertTestDB: () => insertTestDB(),
    deleteAll: () => deleteAll(),
  },
};
export default resolvers;
