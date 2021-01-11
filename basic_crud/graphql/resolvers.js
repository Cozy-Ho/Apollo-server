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

const resolvers = {
  Query: {
    movies: (_, { orderby }) => getMovies(orderby),
    movie: (_, { title }) => getByTitle(title),
    pageMovies: (_, { perpage, curpage }) => pageMovies(perpage, curpage),
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
