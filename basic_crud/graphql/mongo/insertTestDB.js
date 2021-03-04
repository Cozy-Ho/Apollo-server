async function insertTestDB(args) {
    if (args.new) {
        return await createTable(args);
    }
    try {
        let item_arr = [];
        for (let i = 0; i < 10000; i++) {
            let ti = Math.random().toString(36).substring(7);
            let des = Math.random().toString(36).substring(7);
            let sco = Math.floor(Math.random() * 99 + 1);
            let wat = Math.floor(Math.random() * 10) % 2 == 0 ? true : false;
            let inf =
                Math.floor(Math.random() * 10) % 2 == 0
                    ? { lang: "eng", subtitle: "kor" }
                    : { lang: "kor", dubbing: "eng" };
            item_arr.push({
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
            });
        }
        // console.log(item_arr);
        await Movie.insertMany(item_arr);

        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}
