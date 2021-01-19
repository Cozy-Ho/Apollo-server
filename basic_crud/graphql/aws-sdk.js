var AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
// var ddb = new AWS.DynamoDB({ apiVersion: "2021-01-18" });
// Create DynamoDB document client
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2021-01-18" });
import { v4 as uuidv4 } from "uuid";

const tablename = "test02-movie3";
let params = {
  TableName: tablename,
};

function search(params) {
  return new Promise(function (resolve, reject) {
    docClient.query(params, function (err, data) {
      if (err) {
        console.log(err);
        return reject(err);
      } else {
        console.log(data.Items);
        return resolve(data.Items);
      }
    });
  });
}

async function searchMovie(args) {
  return new Promise(function (resolve, reject) {
    params.ExpressionAttributeValues = {
      ":z": 1,
    };
    params.KeyConditionExpression = "dumy= :z ";
    if (args.search) {
      // 1. search
      let andor;
      if (args.andor == "and") {
        andor = "and";
      } else {
        andor = "or";
      }
      console.log(args.search);
      let key = Object.getOwnPropertyNames(args.search);
      let value = args.search[key[0]];
      key = key[0];
      console.log(key, value);

      if (key == "title") {
        params.ExpressionAttributeValues[":t"] = value;
        // params.KeyConditionExpression += andor + " title= :t ";
        params.KeyConditionExpression += "and title=:t";
        console.log(params);
      }

      if (args.orderby != null && args.pagination != null) {
        // 2. search + sort + page
        //
      } else if (args.orderby) {
        // 3. search + sort
        //
      } else if (args.pagination) {
        // 4. search + page
        //
      }

      search(params)
        .then((res) => {
          return resolve(res);
        })
        .catch((err) => {
          return reject(err);
        });
    } else if (args.orderby) {
      // 5. sort
      //
      // 6. sort + page
      if (args.pagination) {
        //
      }
    } else if (args.pagination) {
      // 7. page
      //
    } else {
      search(params)
        .then((res) => {
          return resolve(res);
        })
        .catch((err) => {
          return reject(err);
        });
    }
    return null;
  });
}

async function getMovie(id) {
  return new Promise(function (resolve, reject) {
    params.Key = { id: id };
    docClient.get(params, function (err, data) {
      if (err) {
        console.log("Error", err);
        return reject(err);
      } else {
        console.log("Success", data.Item);
        return resolve(data.Item);
      }
    });
  });
}

async function createMovie(args) {
  return new Promise(function (resolve, reject) {
    params.Item = {
      dumy: 1,
      id: uuidv4(),
      title: args.title,
      desc: args.desc || "",
      score: args.score || "0",
      watched: args.watched || false,
      info: args.info,
    };

    docClient.put(params, function (err, data) {
      if (err) {
        console.log("Error", err);
        return reject(err);
      } else {
        console.log("Success", data);
        return resolve(params.Item);
      }
    });
  });
}

async function updateMovie(args) {
  return new Promise(function (resolve, reject) {
    getMovie(args.id).then((origin) => {
      console.log(args);
      console.log(origin);
      params.Key = { id: args.id };
      params.UpdateExpression =
        "SET title = :t, score = :s,watched = :w, #desc=:d, info=:i ";
      params.ExpressionAttributeNames = {
        "#desc": "desc",
      };
      params.ExpressionAttributeValues = {
        ":t": args.title || origin.title,
        ":d": args.desc || origin.desc || "",
        ":s": args.score || origin.score || "0",
        ":w": args.watched || origin.watched || false,
        ":i": args.info || origin.info,
      };

      docClient.update(params, function (err, data) {
        if (err) {
          console.log("Error", err);
          return reject(err);
        } else {
          console.log("Success", data);
          return resolve(args);
        }
      });
    });
  });
}

async function removeMovie(id) {
  return new Promise(function (resolve, reject) {
    params.Key = { id: id };

    docClient.delete(params, function (err, data) {
      if (err) {
        console.log("Error", err);
        reject("삭제 실패!");
      } else {
        console.log("Success", data);
        resolve("삭제완료");
      }
    });
  });
}

module.exports = {
  getMovie,
  searchMovie,
  createMovie,
  removeMovie,
  updateMovie,
};

// searchMovie({ key: { title: "test" } });
// getMovie("ba7ef17e-f295-4499-8d1b-f7c8dd02a58f");
// createMovie({ title: "test" });
// updateMovie();
// removeMovie();