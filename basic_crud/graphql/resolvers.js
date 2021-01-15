import {
  insertTestDB,
  deleteAll,
  setDatabase,
  searchMovie,
  addMovie,
  updateMovie,
  deleteMovie,
} from "./interface";

let showTimeoutError = false;

const resolvers = {
  Err: {
    __resolveType: (obj) => {
      if (obj.reason) {
        return "TimeoutError";
      }
      if (obj.field) {
        return "ValidationError";
      }
      return null;
    },
  },
  Query: {
    searchMovie: (
      _,
      { title, score, watched, orderby, curpage, perpage, err }
    ) => searchMovie(title, score, watched, orderby, curpage, perpage, err),
  },
  Mutation: {
    register: () => {
      let error = {};
      if (showTimeoutError) {
        error = { reason: "Too many requests", seconds: 180 };
      } else {
        error = { field: "Movie", msg: "상영 종료되었습니다!" };
      }
      showTimeoutError = !showTimeoutError;
      return error;
    },

    addMovie: (_, { title, score, desc, watched }) =>
      addMovie(title, score, desc, watched),
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
