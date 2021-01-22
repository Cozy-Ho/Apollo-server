import mongo_movie from "./movie";
import dynamo_movie from "./dynamo_movie";
import aws_movie from "./aws-sdk";
import config from "../config/config";

function insertTestDB() {
  try {
    if (config.select == "mongo") {
      return mongo_movie.insertTestDB();
    } else if (config.select == "dynamo") {
      return dynamo_movie.insertTestDB();
    } else {
      throw err;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function deleteAll() {
  try {
    if (config.select == "mongo") {
      return await mongo_movie.deleteAll();
    } else if (config.select == "dynamo") {
      return await dynamo_movie.deleteAll();
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
      return await mongo_movie.searchMovie(args);
    } else if (config.select == "dynamo") {
      return await dynamo_movie.searchMovie(args);
    } else {
      return await aws_movie.searchMovie(args);
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getMovie(id) {
  try {
    if (config.select == "mongo") {
      return await mongo_movie.getMovie(id);
    } else if (config.select == "dynamo") {
      return await dynamo_movie.getMovie(id);
    } else {
      return await aws_movie.getMovie(id);
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function createMovie(args) {
  try {
    if (config.select == "mongo") {
      return await mongo_movie.createMovie(args);
    } else if (config.select == "dynamo") {
      return await dynamo_movie.createMovie(args);
    } else {
      return await aws_movie.createMovie(args);
    }
  } catch (err) {
    console.log(err);
  }
}

async function updateMovie(args) {
  try {
    if (config.select == "mongo") {
      return await mongo_movie.updateMovie(args);
    } else if (config.select == "dynamo") {
      return await dynamo_movie.updateMovie(args);
    } else {
      return await aws_movie.updateMovie(args);
    }
  } catch (err) {
    console.log(err);
  }
}

async function removeMovie(id) {
  try {
    if (config.select == "mongo") {
      return await mongo_movie.removeMovie(id);
    } else if (config.select == "dynamo") {
      return await dynamo_movie.removeMovie(id);
    } else {
      return await aws_movie.removeMovie(id);
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  insertTestDB,
  deleteAll,
  setDatabase,
  searchMovie,
  getMovie,
  createMovie,
  updateMovie,
  removeMovie,
};
