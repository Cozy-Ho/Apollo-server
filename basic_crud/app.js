import { GraphQLServer } from "graphql-yoga";
import resolvers from "./graphql/resolvers";
import AWS from "aws-sdk";

import dbConnect from "./models";
dbConnect();

const server = new GraphQLServer({
  typeDefs: "graphql/schema.graphql",
  resolvers,
});

var dynamodb = new AWS.DynamoDB();
// dynamodb.batchExecuteStatement(params, function (err, data) {
//   if (err) console.log(err, err.stack);
//   // an error occurred
//   else console.log(data); // successful response
// });

server.start(() => console.log("GraphQL Server is Running..."));
