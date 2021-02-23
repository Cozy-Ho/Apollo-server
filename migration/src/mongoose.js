import fs from "fs";
import mongoose from "mongoose";
import mongoSchema from "../models/mongo.js";

export function mongo_export(res, option) {
    let filename = res.filename;
    let Movie = mongoose.model(res.tablename, mongoSchema);
    try {
        fs.unlinkSync(`./data/${res.filename}.json`);
    } catch (err) {
        console.log("file not exist");
    }
    console.time("EXPORT");
    Movie.count({}, async function (err, count) {
        console.log(count);
        let len = count;
        for (let i = 0; i < len / 100000 + 1; i++) {
            let skip = i * 100000;
            let limit = 100000;
            await Movie.find(option)
                .skip(skip)
                .limit(limit)
                .then(async (res) => {
                    const buf = await Buffer.from(JSON.stringify(res));
                    await fs.appendFileSync(`./data/${filename}_${i}.json`, buf);
                    console.log("DONE>>>", (i + 1) * 100000);
                });
        }
        console.timeEnd("EXPORT");
    });
}

export function mongo_import(res) {
    let filename = res.filename;
    let Movie = mongoose.model(res.tablename, mongoSchema);
    console.time("IMPORT");
    fs.readdir("./data/", async function (err, filenames) {
        if (err) {
            console.log(err);
            return;
        }
        await filenames.forEach(function (filename) {
            if (filename.startsWith(res.filename)) {
                fs.readFile(`./data/${filename}`, "utf8", async function (err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        console.log(data.length, "개 데이터를 저장합니다.");
                        await Movie.insertMany(data);
                    }
                });
            }
        });
    });
    console.timeEnd("IMPORT");
}
