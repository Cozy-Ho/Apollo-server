var AWS = require("aws-sdk");
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

AWS.config.update({ region: "us-east-2" });
// var ddb = new AWS.DynamoDB({ apiVersion: "2021-01-18" });
// Create DynamoDB document client
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2021-01-18" });
var ddb = new AWS.DynamoDB({ apiVersion: "2021-01-18" });

let tablename = "test02-movie4";

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

function search(params) {
  return new Promise(function (resolve, reject) {
    console.log(params);
    docClient.query(params, function (err, data) {
      if (err) {
        console.log(err);
        return reject(err);
      } else {
        console.log(">>> SEARCH_DONE >>>");
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

function setTableName(tName) {
  tablename = tName;
}

async function createTable(args) {
  let params = {
    AttributeDefinitions: [
      {
        AttributeName: "dumy",
        AttributeType: "N",
      },
      {
        AttributeName: "id",
        AttributeType: "S",
      },
      {
        AttributeName: "title",
        AttributeType: "S",
      },
      {
        AttributeName: "score",
        AttributeType: "N",
      },
      {
        AttributeName: "desc",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "dumy",
        KeyType: "HASH",
      },
      {
        AttributeName: "id",
        KeyType: "RANGE",
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
    LocalSecondaryIndexes: [
      {
        IndexName: "title-index",
        KeySchema: [
          {
            AttributeName: "dumy",
            KeyType: "HASH",
          },
          {
            AttributeName: "title",
            KeyType: "RANGE",
          },
        ],
        Projection: {
          ProjectionType: "ALL",
        },
      },
      {
        IndexName: "score-index",
        KeySchema: [
          {
            AttributeName: "dumy",
            KeyType: "HASH",
          },
          {
            AttributeName: "score",
            KeyType: "RANGE",
          },
        ],
        Projection: {
          ProjectionType: "ALL",
        },
      },
      {
        IndexName: "desc-index",
        KeySchema: [
          {
            AttributeName: "dumy",
            KeyType: "HASH",
          },
          {
            AttributeName: "desc",
            KeyType: "RANGE",
          },
        ],
        Projection: {
          ProjectionType: "ALL",
        },
      },
    ],
    TableName: args.tableName,
    StreamSpecification: {
      StreamEnabled: false,
    },
  };
  ddb.createTable(params, function (err, data) {
    if (err) {
      console.log("error", err);
      return false;
    } else {
      console.log("Table Created!", data);
      setTableName(args.tableName);
      return true;
    }
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

async function deleteAll() {
  let params = {
    TableName: tablename,
  };
  params.ExpressionAttributeValues = {
    ":z": 1,
  };
  params.KeyConditionExpression = "dumy= :z ";
  params.ProjectionExpression = "dumy, id";
  let ids = await search(params);
  console.log(ids);
  ids = ids.Items;
  let item_arr = [];
  try {
    for (let i = 0; i < ids.length; i++) {
      item_arr.push({
        DeleteRequest: {
          Key: {
            dumy: 1,
            id: ids[i].id,
          },
        },
      });
    }
    // console.log(item_arr);
    for (let j = 0; j < item_arr.length / 25 + 1; j++) {
      let begin = j * 25;
      let end = begin + 25;
      if (!item_arr[begin]) break;

      let new_params = {
        RequestItems: {
          [tablename]: item_arr.slice(begin, end),
        },
      };

      docClient.batchWrite(new_params, function (err, data) {
        if (err) {
          console.log("err", err);
        } else {
          console.log("DELETED>>>" + j, data);
        }
      });
      await sleep(500);
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function insertTestDB(args) {
  if (args.new) {
    return await createTable(args);
  }
  let item_arr = [];

  // A single call to BatchWriteItem can write up to 16 MB of data,
  // which can comprise as many as 25 put or delete requests.
  // Individual items to be written can be as large as 400 KB.
  // BatchWriteItem cannot update items
  try {
    for (let t = 0; t < 400; t++) {
      for (let i = 0; i < 25; i++) {
        let ti = Math.random().toString(36).substring(7);
        let des = Math.random().toString(36).substring(7);
        let sco = Math.floor(Math.random() * 99 + 1);
        let wat = (Math.random() * 10) % 2 == 0 ? true : false;
        let inf =
          (Math.random() * 10) % 6 == 0
            ? { lang: "eng", subtitle: "kor" }
            : (Math.random() * 10) % 2 == 0
            ? { lang: "kor", dubbing: "eng" }
            : { lang: "eng", dubbing: "jap" };
        item_arr.push({
          PutRequest: {
            Item: {
              dumy: 1,
              id: uuidv4(),
              title: ti,
              score: sco,
              desc: des,
              s_title: ti,
              s_score: sco,
              s_desc: des,
              watched: wat,
              info: inf,
            },
          },
        });
      }
      let params = {
        RequestItems: {
          [tablename]: item_arr,
        },
      };
      // console.log(item_arr);
      // console.log(params);
      const ret = await docClient.batchWrite(params, function (err, data) {
        if (err) {
          console.log("error", err);
          return false;
        } else {
          console.log("success>>>" + t, data);
          return true;
        }
      });
      await sleep(500);
      if (ret) {
        item_arr = [];
      }
    }

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

module.exports = {
  getMovie,
  searchMovie,
  createMovie,
  removeMovie,
  updateMovie,
  insertTestDB,
  deleteAll,
  createTable,
};
