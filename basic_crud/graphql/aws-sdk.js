var AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
// var ddb = new AWS.DynamoDB({ apiVersion: "2021-01-18" });
// Create DynamoDB document client
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2021-01-18" });
import { v4 as uuidv4 } from "uuid";

const tablename = "test02-movie4";

function search(params) {
  return new Promise(function (resolve, reject) {
    docClient.query(params, function (err, data) {
      if (err) {
        // console.log(err);
        return reject(err);
      } else {
        // console.log(data.Items);
        return resolve(data.Items);
      }
    });
  });
}

async function searchMovie(args) {
  let params = {
    TableName: tablename,
  };
  return new Promise(function (resolve, reject) {
    params.ExpressionAttributeValues = {
      ":z": 1,
    };
    params.KeyConditionExpression = "dumy= :z ";
    if (args) {
      if (args.search) {
        // 1. search
        let key = Object.getOwnPropertyNames(args.search);
        // and,or 검색 조건부
        let filter = [];
        if (key.includes("title")) {
          params.ExpressionAttributeValues[":t"] = args.search["title"];
          filter.push("title=:t");
        }
        if (key.includes("score")) {
          params.ExpressionAttributeValues[":s"] = args.search["score"];
          params.FilterExpression += andor + " score=:s ";
        }
        if (key.includes("desc")) {
          params.ExpressionAttributeValues[":d"] = args.search["desc"];
          // DB reserved name 사용
          params.ExpressionAttributeNames = {
            "#desc": "desc",
          };
          filter.push("#desc=:d");
        }
        if (key.includes("watched")) {
          params.ExpressionAttributeValues[":w"] = args.search["watched"];
          filter.push("watched=:w");
        }
        if (key.includes("info")) {
          let info_key = Object.getOwnPropertyNames(args.search["info"]);
          console.log(info_key);
          if (info_key.includes("lang")) {
            params.ExpressionAttributeValues[":l"] = args.search["info"].lang;
            filter.push("info.lang=:l");
          }
          if (info_key.includes("subtitle")) {
            params.ExpressionAttributeValues[":sub"] =
              args.search["info"].subtitle;
            filter.push("info.subtitle=:sub");
          }
          if (info_key.includes("dubbing")) {
            params.ExpressionAttributeValues[":dub"] =
              args.search["info"].dubbing;
            filter.push("info.dubbing=:dub");
          }
        }

        // AND or OR search
        if (args.search.andor == "and" || args.search.andor == null) {
          params.FilterExpression = filter.join(" and ");
        } else if (args.search.andor == "or") {
          params.FilterExpression = filter.join(" or ");
        }
      }
      if (args.orderby) {
        // order
        let key = Object.getOwnPropertyNames(args.orderby);
        let order = args.orderby[key[0]];
        key = key[0];

        // Sort- key 설정
        params.IndexName = key + "-index";
        if (order == "asc") {
          params.ScanIndexForward = true;
        } else {
          params.ScanIndexForward = false;
        }
      }
      if (args.pagination) {
        const perpage = args.pagination.perpage;
        const curpage = args.pagination.curpage;
        // params.ExclusiveStartKey = { dumy: 1 };
        params.Limit = perpage + 1;
      }
      //
      search(params)
        .then((res) => {
          console.log(res);
          return resolve(res);
        })
        .catch((err) => {
          console.log(err);
          return reject(err);
        });
    } else {
    }
  });
}

async function getMovie(id) {
  let params = {
    TableName: tablename,
  };
  return new Promise(function (resolve, reject) {
    console.log(params);
    params.ExpressionAttributeValues = {
      ":z": 1,
      ":i": id,
    };
    params.KeyConditionExpression = "dumy = :z and id = :i";
    // params.FilterExpression = { id: id };
    docClient.query(params, function (err, data) {
      if (err) {
        console.log("Error", err);
        return reject(err);
      } else {
        console.log("Success", data.Items);
        return resolve(data.Items[0]);
      }
    });
  });
}

async function createMovie(args) {
  let params = {
    TableName: tablename,
  };
  return new Promise(function (resolve, reject) {
    params.Item = {
      dumy: 1,
      id: uuidv4(),
      title: args.title,
      desc: args.desc || "",
      score: args.score || 0,
      watched: args.watched || false,
      info: args.info,
    };
    console.log(params.Item);
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
  let params = {
    TableName: tablename,
  };
  return new Promise(function (resolve, reject) {
    getMovie(args.id).then((origin) => {
      if (!args.title) {
        args.title = origin.title;
      }
      params.Key = { id: args.id, dumy: 1 };
      params.UpdateExpression =
        "SET #title = :t, #score = :s, #watched = :w, #desc=:d, #info=:i ";
      params.ExpressionAttributeNames = {
        "#title": "title",
        "#desc": "desc",
        "#score": "score",
        "#watched": "watched",
        "#info": "info",
      };
      params.ExpressionAttributeValues = {
        ":t": args.title,
        ":d": args.desc || origin.desc || "",
        ":s": args.score || origin.score || 0,
        ":w": args.watched || origin.watched || false,
        ":i": args.info || origin.info,
      };
      console.log(params);
      docClient.update(params, function (err, data) {
        if (err) {
          console.log("Error", err);
          return reject(err);
        } else {
          console.log("Success", data.Item);
          return resolve(args);
        }
      });
    });
  });
}

async function removeMovie(id) {
  let params = {
    TableName: tablename,
  };
  return new Promise(function (resolve, reject) {
    params.Key = { dumy: 1, id: id };

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
