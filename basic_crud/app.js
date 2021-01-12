import { GraphQLServer } from "graphql-yoga";
import resolvers from "./graphql/resolvers";

// import dbConnect from "./models";
// dbConnect();

import dynamodb from "./models";
dynamodb();

const server = new GraphQLServer({
  typeDefs: "graphql/schema.graphql",
  resolvers,
});

// server.start(() => console.log("GraphQL Server is Running..."));
server.start().then(() => {
  console.log(`🚀  Server is ready!`);
});
