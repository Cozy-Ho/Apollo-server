const {bodyParserGraphQL} = require('body-parser-graphql');
const express = require('express');
const {ApolloServer} = require('apollo-server-express');
const compression=require('compression');

const fs = require('fs');
const typeDefs=fs.readFileSync("./graphql/schema.graphql",{encoding:'utf-8'});
const resolvers = require('./graphql/resolvers');

const port = 4000;

const app = express();

app.use(bodyParserGraphQL());
app.use(compression());

const server = new ApolloServer({
    typeDefs,resolvers,introspection:true,playground:true,
});

server.applyMiddleware({
    app,
    path:"/graphql"
});

app.listen(port, function(){
    console.log("🚀  Server ready at playground")
})