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
    updateMovie: (_, { title, score }) => updateMovie(title, score),
    insertTestDB: () => insertTestDB(),
    deleteAll: () => deleteAll(),
  },
};
export default resolvers;
