import * as convert_logic from "./convert_logic.js";
import fs from "fs";

export function convert(res) {
    fs.readFile(`./data/${res.input_filename}.json`, "utf8", async function (err, data) {
        if (err) {
            console.log(err);
            return;
        } else {
            let result;
            data = JSON.parse(data);
            data = data.flat();
            // console.log(data.length);
            result = convert_logic.main_logic(data, res.logic);
            const buf = Buffer.from(JSON.stringify(result));
            fs.writeFile(`./data/${res.output_filename}.json`, buf, function (err) {
                if (err) console.log(err);
                else {
                    console.log("DONE >>> ");
                }
            });
        }
    });
}
