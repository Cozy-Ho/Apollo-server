var AWS = require("aws-sdk");
import { v4 as uuidv4 } from "uuid";

AWS.config.update({ region: "us-east-2" });
// var ddb = new AWS.DynamoDB({ apiVersion: "2021-01-18" });
// Create DynamoDB document client
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2021-01-18" });
const tablename = "test02-movie4";

function search(params) {
  return new Promise(function (resolve, reject) {
    console.log(params);
    docClient.query(params, function (err, data) {
      if (err) {
        console.log(err);
        return reject(err);
      } else {
        console.log(data);
        return resolve(data);
      }
    });
  });
}

function page(movies, pagination) {
  // console.log(movies);
  const curpage = pagination.curpage;
  const perpage = pagination.perpage;
  let movie_arr = movies.Items;
  let max = movie_arr.length;
  let ret;
  let tot_page;
  if (max % perpage != 0) {
    tot_page = parseInt(max / perpage) + 1;
  } else {
    tot_page = max / perpage;
  }

  let offset = (curpage - 1) * perpage;
  // console.log(movie_arry);
  if (curpage <= tot_page) {
    ret = movie_arr.slice(offset, offset + perpage);
  } else {
    ret = [];
  }
  return ret;
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
    if (args.search) {
      // 1. search
      let key = Object.getOwnPropertyNames(args.search);
      // and,or 검색 조건부
      let filter = [];
      if (key.includes("title")) {
        params.ExpressionAttributeValues[":t"] = args.search["title"];
        filter.push("s_title=:t");
      }
      if (key.includes("score")) {
        params.ExpressionAttributeValues[":s"] = args.search["score"];
        filter.push("s_score=:s");
      }
      if (key.includes("desc")) {
        params.ExpressionAttributeValues[":d"] = args.search["desc"];
        // DB reserved name 사용
        params.ExpressionAttributeNames = {
          "#desc": "s_desc",
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
      if (key != "id") {
        params.IndexName = key + "-index";
      }
      if (order == "asc") {
        params.ScanIndexForward = true;
      } else {
        params.ScanIndexForward = false;
      }
    }
    if (args.pagination) {
      search(params)
        .then((movies) => {
          const result = page(movies, args.pagination);
          return resolve(result);
        })
        .catch((err) => {
          return reject(err);
        });
    }
    search(params)
      .then((data) => {
        return resolve(data.Items);
      })
      .catch((err) => {
        return reject(err);
      });
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
      let watched;
      if (origin.watched != null) {
        if (args.watched != null) {
          watched = args.watched;
        } else {
          watched = origin.watched;
        }
      } else {
        if (args.watched != null) {
          watched = args.watched;
        } else {
          watched = false;
        }
      }
      params.Key = { id: args.id, dumy: 1 };
      params.UpdateExpression =
        "SET #title = :t, #score = :s, #watched = :w, #desc=:d, #info=:i, s_title=:t,s_score=:s,s_desc=:d ";
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
        ":w": watched,
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
