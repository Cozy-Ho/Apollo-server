import { GraphQLServer } from "graphql-yoga";
import resolvers from "./graphql/resolvers";
import config from "./config/config";
import db from "./models";

// if (config.select == "mongo") {
//   db.conn_mongo();
// } else if (config.select == "dynamo") {
//   db.conn_dynamo();
// }
db.conn_mongo();
db.conn_dynamo();

const server = new GraphQLServer({
  typeDefs: "graphql/schema.graphql",
  resolvers,
});

// server.start(() => console.log("GraphQL Server is Running..."));
server.start().then(() => {
  console.log(`🚀  Server is ready!`);
});
