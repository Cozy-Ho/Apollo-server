export function main_logic(data, logic) {
    let ret_arr = [];

    if (logic.toUpperCase() == "ADD") {
        ret_arr = add_item(data);
    } else if (logic.toUpperCase() == "UPDATE") {
        ret_arr = update_item(data);
    } else if (logic.toUpperCase() == "DELETE") {
        ret_arr = delete_item(data);
    }

    return ret_arr;
}

function add_item(data, origin) {
    let ret_arr = [];
    ret_arr = data;
    ret_arr.push({
        dumy: 1,
        id: "test",
        title: "wow",
        desc: "wow",
    });
    return ret_arr;
}

function update_item(data) {
    let ret_arr = [];
    ret_arr = data;
    for (let i = 0; i < ret_arr.length; i++) {
        if (ret_arr[i].score > 50) {
            ret_arr[i]["favorite"] = "good";
        } else {
            ret_arr[i]["favorite"] = "soso";
        }
    }
    return ret_arr;
}

function delete_item(data) {
    let ret_arr = [];
    ret_arr = data;
    for (let i = 0; i < ret_arr.length; i++) {
        delete ret_arr[i]["score"];
    }
    return ret_arr;
}
