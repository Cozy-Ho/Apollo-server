import { GraphQLServer } from "graphql-yoga";
// import { ApolloServer } from "apollo-server";
// import typeDefs from "./graphql/schema.graphql";
import resolvers from "./graphql/resolvers";
import config from "./config/config";
import db from "./models";
let db_select = process.argv.slice(2)[0];

if (db_select == "mongo") {
  config.select = "mongo";
  console.log("DB selected : " + db_select);
} else if (db_select == "dynamo") {
  config.select = "dynamo";
  console.log("DB selected : " + db_select);
} else {
  config.select = "aws";
  console.log("DB selected : " + db_select);
}
// 모두 연결.
// 파라미터에 따라서 다른 DB로 연결하도록 수정해야함.
db.conn_mongo();
db.conn_dynamo();
db.conn_aws_sdk();

const server = new GraphQLServer({
  typeDefs: "graphql/schema.graphql",
  resolvers,
});

server.start(() => console.log("🚀  GraphQL Server is Running..."));

// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
// });

// server.listen().then(({ url }) => {
//   console.log(`🚀  Server ready at ${url}`);
// });
