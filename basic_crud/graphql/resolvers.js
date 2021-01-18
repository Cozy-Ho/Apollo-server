import {
  insertTestDB,
  deleteAll,
  setDatabase,
  searchMovie,
  getMovie,
  createMovie,
  updateMovie,
  removeMovie,
} from "./interface";

const resolvers = {
  Info: {
    __resolveType(obj) {
      if (obj.subtitle) {
        return "Sub";
      }
      if (obj.dubbing) {
        return "Dub";
      }
      return null;
    },
  },
  Query: {
    // title, score, watched, orderby, curpage, perpage, err
    searchMovie: (_, { ...args }) => searchMovie(args),
    getMovie: (_, { id }) => getMovie(id),
  },
  Mutation: {
    // title, score, desc, watched, info
    createMovie: (_, { ...args }) => createMovie(args),
    removeMovie: (_, { id }) => removeMovie(id),
    // id, title, score
    updateMovie: (_, { ...args }) => updateMovie(args),

    // TestDB
    insertTestDB: () => insertTestDB(),
    deleteAll: () => deleteAll(),
    // Set database
    setDatabase: (_, { flag }) => setDatabase(flag),
  },
};
export default resolvers;
