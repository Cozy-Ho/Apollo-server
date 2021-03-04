import readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

export function input() {
    return new Promise(function (resolve, reject) {
        let command;
        let db;
        let tablename;
        let filename;
        let option;
        let input_filename;
        let output_filename;
        let logic;
        rl.question(
            '\
      ================================================================================\n\
      This is Migration tool for DynamoDB and MongoDB\n\
      Please type a command with below Format.\n\
      { export | import } { SDK | dynamo | mongo } { table_name } { filename } { option }\n\
      { convert } { input_filename } { output_filename } { convert_logic_filename } \n\
      (ex) export mongo movie2 test {"title":"abc","score":"25","andor":"or"}\n\
      Ctrl+C to quit this program.\n\
      ================================================================================\n\
      ',
            (line) => {
                let input = line.split(" ");
                command = input[0];
                if (command == "convert") {
                    input_filename = input[1];
                    output_filename = input[2];
                    logic = input[3];
                } else {
                    db = input[1];
                    tablename = input[2];
                    filename = input[3];
                    option = input[4];
                }
                rl.close();
                resolve({
                    command: command,
                    db: db,
                    tablename: tablename,
                    filename: filename,
                    option: option,
                    input_filename: input_filename,
                    output_filename: output_filename,
                    logic: logic,
                });
            }
        );
    });
}
