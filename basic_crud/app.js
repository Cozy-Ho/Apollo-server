import { GraphQLServer } from "graphql-yoga";
import resolvers from "./graphql/resolvers";
import config from "./config/config";
import db from "./models";

let db_select = process.argv.slice(2)[0];
// console.log(db_select);

if (db_select == "mongo") {
  config.select = "mongo";
  console.log("DB selected : " + db_select);
} else if (db_select == "dynamo") {
  config.select = "dynamo";
  console.log("DB selected : " + db_select);
}

db.conn_mongo();
db.conn_dynamo();

const server = new GraphQLServer({
  typeDefs: "graphql/schema.graphql",
  resolvers,
});

server.start(() => console.log("🚀  GraphQL Server is Running..."));
