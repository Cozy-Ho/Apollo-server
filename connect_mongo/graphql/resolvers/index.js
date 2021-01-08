import Person from "../../models/person";

const resolvers = {
  Query: {
    async people(_, args) {
      try {
        const people = await Person.find();
        return people;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Person: {
    _id(_, args) {
      return _._id;
    },
    name(_, args) {
      return _.name;
    },
    async friends(_, args) {
      const friends = await Person.find({ _id: { $in: _.friendIds } });
      return friends;
    },
  },
};

export default resolvers;
