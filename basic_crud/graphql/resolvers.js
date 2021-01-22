import * as EnterPoint from "./interface";

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
    searchMovie: (_, { ...args }) => EnterPoint.searchMovie(args),
    getMovie: (_, { id }) => EnterPoint.getMovie(id),
  },
  Mutation: {
    // title, score, desc, watched, info
    createMovie: (_, { ...args }) => EnterPoint.createMovie(args),
    removeMovie: (_, { id }) => EnterPoint.removeMovie(id),
    // id, title, score
    updateMovie: (_, { ...args }) => EnterPoint.updateMovie(args),

    // TestDB
    insertTestDB: () => EnterPoint.insertTestDB(),
    deleteAll: () => EnterPoint.deleteAll(),
    // Set database
    setDatabase: (_, { flag }) => EnterPoint.setDatabase(flag),
  },
};
export default resolvers;
