import mongo_movie from "./mongo/index.js";
import dynamo_movie from "./dynamo/index.js";
import aws_movie from "./sdk/index.js";
import config from "../config/config.js";

let tableName = "test02-movie";

async function deleteAll() {
    try {
        if (config.select == "mongo") {
            return await mongo_movie.deleteAll(tableName);
        } else if (config.select == "dynamo") {
            return await dynamo_movie.deleteAll(tableName);
        } else if (config.select == "aws") {
            return await aws_movie.deleteAll(tableName);
        } else {
            throw err;
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function setDatabase(flag) {
    try {
        if (flag == 0) {
            config.select = "mongo";
            return "Set Database as MongoDB";
        } else if (flag == 1) {
            config.select = "dynamo";
            return "Set Database as DynamoDB";
        } else if (flag == 2) {
            config.select = "aws";
            return "Setted AWS-SDK";
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function searchMovie(args) {
    try {
        if (config.select == "mongo") {
            return await mongo_movie.searchMovie(args, tableName);
        } else if (config.select == "dynamo") {
            return await dynamo_movie.searchMovie(args, tableName);
        } else {
            return await aws_movie.searchMovie(args, tableName);
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function getMovie(id) {
    try {
        if (config.select == "mongo") {
            return await mongo_movie.getMovie(id, tableName);
        } else if (config.select == "dynamo") {
            return await dynamo_movie.getMovie(id, tableName);
        } else {
            return await aws_movie.getMovie(id, tableName);
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function createMovie(args) {
    try {
        if (config.select == "mongo") {
            return await mongo_movie.createMovie(args, tableName);
        } else if (config.select == "dynamo") {
            return await dynamo_movie.createMovie(args, tableName);
        } else {
            return await aws_movie.createMovie(args, tableName);
        }
    } catch (err) {
        console.log(err);
    }
}

async function updateMovie(args) {
    try {
        if (config.select == "mongo") {
            return await mongo_movie.updateMovie(args, tableName);
        } else if (config.select == "dynamo") {
            return await dynamo_movie.updateMovie(args, tableName);
        } else {
            return await aws_movie.updateMovie(args, tableName);
        }
    } catch (err) {
        console.log(err);
    }
}

async function removeMovie(id) {
    try {
        if (config.select == "mongo") {
            return await mongo_movie.removeMovie(id, tableName);
        } else if (config.select == "dynamo") {
            return await dynamo_movie.removeMovie(id, tableName);
        } else {
            return await aws_movie.removeMovie(id, tableName);
        }
    } catch (err) {
        console.log(err);
    }
}

export default {
    deleteAll,
    setDatabase,
    searchMovie,
    getMovie,
    createMovie,
    updateMovie,
    removeMovie,
};
