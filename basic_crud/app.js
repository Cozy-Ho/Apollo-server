import { GraphQLServer } from "graphql-yoga";
import resolvers from "./graphql/resolvers";

import dbConnect from "./models";
dbConnect();

const server = new GraphQLServer({
  typeDefs: "graphql/schema.graphql",
  resolvers,
});

server.start(() => console.log("GraphQL Server is Running..."));
