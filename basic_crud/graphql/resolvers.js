import * as EnteryPoint from "./interface";

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
    searchMovie: (_, { ...args }) => EnteryPoint.searchMovie(args),
    getMovie: (_, { id }) => EnteryPoint.getMovie(id),
  },
  Mutation: {
    // title, score, desc, watched, info
    createMovie: (_, { ...args }) => EnteryPoint.createMovie(args),
    removeMovie: (_, { id }) => EnteryPoint.removeMovie(id),
    // id, title, score
    updateMovie: (_, { ...args }) => EnteryPoint.updateMovie(args),

    // TestDB
    insertTestDB: (_, { ...args }) => EnteryPoint.insertTestDB(args),
    deleteAll: () => EnteryPoint.deleteAll(),
    // Set database
    setDatabase: (_, { flag }) => EnteryPoint.setDatabase(flag),
  },
};
export default resolvers;
