import {
  setDatabase,
  getMovie,
  addMovie,
  updateMovie,
  deleteMovie,
} from "./interface";

const resolvers = {
  Query: {
    getMovie: (_, { title, curpage, perpage, orderby }) =>
      getMovie(title, curpage, perpage, orderby),
  },
  Mutation: {
    addMovie: (_, { title, score }) => addMovie(title, score),
    deleteMovie: (_, { title }) => deleteMovie(title),
    updateMovie: (_, { title, score }) => updateMovie(title, score),

    // TestDB
    insertTestDB: () => insertTestDB(),
    deleteAll: () => deleteAll(),
    // Set database
    setDatabase: (_, { flag }) => setDatabase(flag),
  },
};
export default resolvers;
