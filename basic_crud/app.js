import { GraphQLServer } from "graphql-yoga";
import resolvers from "./graphql/resolvers.js";
import config from "./config/config.js";
import connect_all from "./models/index.js";

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
connect_all();

const server = new GraphQLServer({
    typeDefs: "graphql/schema.graphql",
    resolvers,
});

server.start(() => console.log("🚀  GraphQL Server is Running..."));
