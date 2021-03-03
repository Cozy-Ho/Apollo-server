import fs from "fs";
import { v4 as uuidv4 } from "uuid";

let item_arr = [];
for (let i = 0; i < 1000000; i++) {
    let dum = Math.floor(Math.random() * 5000) % 5000;
    let ti = Math.random().toString(36).substring(7);
    let des = Math.random().toString(36).substring(7);
    let sco = Math.floor(Math.random() * 99 + 1);
    let wat = (Math.random() * 10) % 2 == 0 ? true : false;
    let inf =
        (Math.random() * 10) % 5 == 0
            ? { lang: "eng", subtitle: "kor" }
            : (Math.random() * 10) % 2 == 0
            ? { lang: "kor", dubbing: "eng" }
            : { lang: "eng", dubbing: "jap" };
    item_arr.push({
        dumy: dum,
        id: uuidv4(),
        title: ti,
        score: sco,
        desc: des,
        s_title: ti,
        s_score: sco,
        s_desc: des,
        watched: wat,
        info: inf,
    });
}

const buf = Buffer.from(JSON.stringify(item_arr));
fs.writeFile(`./data/movies.json`, buf, function (err) {
    if (err) console.log(err);
    else console.log("DONE>>>");
});
