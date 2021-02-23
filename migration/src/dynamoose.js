import fs from "fs";
import dynamoose from "dynamoose";
import dynamoSchema from "../models/dynamo.js";

export function dynamo_export(res, option) {
    console.time("EXPORT_TIME");
    dynamo_find(res, option).then((data) => {
        let ret_arr = data.flat();
        console.log(ret_arr.length, "개 데이터를 가져옵니다.");
        const buf = Buffer.from(JSON.stringify(ret_arr));
        fs.writeFile(`./data/${res.filename}.json`, buf, function (err) {
            if (err) console.log(err);
            else {
                console.log("DONE>>>");
                console.timeEnd("EXPORT_TIME");
            }
        });
    });
}

export function dynamo_import(res) {
    console.time("IMPORT_TIME");
    dynamo_put(res).then(() => {
        console.timeEnd("IMPORT_TIME");
    });
}

async function dynamo_search(movies, option) {
    let key = Object.getOwnPropertyNames(option);
    console.log(key);

    if (option.andor == "and" || option.andor == null) {
        if (key.includes("title")) {
            movies = movies.and().where("title").eq(option.title);
        }
        if (key.includes("score")) {
            movies = movies.and().where("score").eq(option.score);
        }
        if (key.includes("desc")) {
            movies = movies.and().where("desc").eq(option.desc);
        }
        if (key.includes("watched")) {
            movies = movies.and().where("watched").eq(option.watched);
        }
        if (key.includes("info")) {
            let info_key = Object.getOwnPropertyNames(option["info"]);
            console.log(info_key);
            if (info_key.includes("lang")) {
                movies = movies.and().where("info.lang").eq(option.info.lang);
            }
            if (info_key.includes("subtitle")) {
                movies = movies.and().where("info.subtitle").eq(option.info.subtitle);
            }
            if (info_key.includes("dubbing")) {
                movies = movies.and().where("info.dubbing").eq(option.info.dubbing);
            }
        }
    } else if (option.andor == "or") {
        movies = movies.and().parenthesis((condition) => {
            if (key.includes("title")) {
                condition = condition.or().where("s_title").eq(option.title);
            }
            if (key.includes("score")) {
                condition = condition.or().where("s_score").eq(option.score);
            }
            if (key.includes("desc")) {
                condition = condition.or().where("s_desc").eq(option.desc);
            }
            if (key.includes("watched")) {
                condition = condition.or().where("watched").eq(option.watched);
            }
            if (key.includes("info")) {
                let info_key = Object.getOwnPropertyNames(option["info"]);
                console.log(info_key);
                if (info_key.includes("lang")) {
                    condition = condition.or().where("info.lang").eq(option.info.lang);
                }
                if (info_key.includes("subtitle")) {
                    condition = condition.or().where("info.subtitle").eq(option.info.subtitle);
                }
                if (info_key.includes("dubbing")) {
                    condition = condition.or().where("info.dubbing").eq(option.info.dubbing);
                }
            }
            return condition;
        });
    }
    return movies;
}
async function dynamo_find(res, option) {
    const Movie = dynamoose.model(res.tablename, dynamoSchema);
    let ret_arr = [];
    let movies;
    if (option) {
        movies = await Movie.query("dumy").eq(1);
        movies = await dynamo_search(movies, option);
        movies = await movies.exec();
        ret_arr.push(movies.toJSON());
        return ret_arr;
    }
    movies = await Movie.query("dumy").eq(1).exec();
    ret_arr.push(movies.toJSON());
    let flag;
    let key = movies.lastKey;
    if (key) {
        flag = true;
    } else {
        flag = false;
    }
    while (flag) {
        let temp = await Movie.query("dumy").eq(1).startAt(key).exec();
        ret_arr.push(temp.toJSON());
        if (temp.lastKey === undefined) {
            flag != flag;
            break;
        } else {
            key = temp.lastKey;
        }
    }
    return ret_arr;
}
async function dynamo_put(res) {
    const Movie = dynamoose.model(res.tablename, dynamoSchema);
    let data = fs.readFileSync(`./data/${res.filename}.json`, "utf8");
    //   console.log(JSON.parse(data));
    data = JSON.parse(data);
    data = data.flat();
    console.log(data.length, "개 데이터를 migration 합니다.");
    let item_arr = [];
    let remain_arr = [];
    for (let i = 0; i < data.length; i++) {
        item_arr.push({
            dumy: data[i].dumy || 1,
            id: data[i].id,
            title: data[i].title,
            socre: data[i].score || 0,
            desc: data[i].desc || "",
            s_title: data[i].title || "",
            s_score: data[i].score || 0,
            s_desc: data[i].desc || "",
            watched: data[i].watched || false,
            info: data[i].info || null,
        });
    }
    for (let i = 0; i < item_arr.length / 25 + 1; i++) {
        let begin = i * 25;
        let end = begin + 25;
        if (!item_arr[begin]) break;
        await Movie.batchPut(item_arr.slice(begin, end))
            .then((res) => {
                console.log("MIGRATING>>>>", res, i);
            })
            .catch((err) => {
                console.log("ERROR >>>", err);
                remain_arr.push(i);
            });
    }
    for (let i = 0; i < remain_arr.length; i++) {
        let begin = remain_arr[i] * 25;
        let end = begin + 25;
        if (!remain_arr[begin]) break;
        await Movie.batchPut(remain_arr.slice(begin, end))
            .then((res) => {
                console.log("REMAIN_DONE >>> ", res, i);
            })
            .catch((err) => {
                console.log("REMAIN_ERROR >>> ", err);
                remain_arr.push(i);
            });
    }
    return true;
}
