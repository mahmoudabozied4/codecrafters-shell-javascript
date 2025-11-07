const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function prompt() {
    rl.question("$ ", (answer) => {
        let ans = answer.trim();

        // echo command
        if (ans.startsWith("echo ")) {
            console.log(ans.slice(5));
            prompt();
            return;
        }

        // exit command
        if (ans === "exit 0") {
            rl.close();
            return;
        }

        // unknown command
        if (ans !== "") {
            console.log(`${ans}: command not found`);
        }

        prompt();
    });
}

prompt();