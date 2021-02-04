import mongo_movie from "./movie";
import dynamo_movie from "./dynamo_movie";
import aws_movie from "./aws-sdk";
import config from "../config/config";

function insertTestDB(args) {
  try {
    if (config.select == "mongo") {
      return mongo_movie.insertTestDB(args);
    } else if (config.select == "dynamo" && !args.new) {
      return dynamo_movie.insertTestDB(args);
    } else if (config.select == "aws" || args.new) {
      return aws_movie.insertTestDB(args);
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
    } else if (config.select == "aws") {
      return await aws_movie.deleteAll();
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

async function migrate(args) {
  if (args.migFrom == "dynamo") {
    if (args.migTo == "mongo") {
      let data = await dynamo_movie.migration({ getData: true });
      return await mongo_movie.migration({ putData: true, data: data });
    } else {
      //
    }
  } else if (args.migFrom == "mongo") {
    if (args.migTo == "dynamo") {
      let data = await mongo_movie.migration({ getData: true });
      return await dynamo_movie.migration({ putData: true, data: data });
    } else {
      //
    }
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
  migrate,
};
