import { gql } from "apollo-server";

const typeDefs = gql`
  type Query {
    people: [Person]
  }
  type Person {
    _id: ID
    name: String
    friends: [Person]
  }
`;

export default typeDefs;
