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
