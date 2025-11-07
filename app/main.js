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

        // type commend
        if (ans.startsWith("type ")) {
            if (ans.slice(5) === "echo" || ans.slice(5) === "exit" || ans.slice(5) === "type") {
                console.log(`${ans.slice(5)} is a shell builtin`);
            }else {
                console.log(`${ans.slice(5)}: not found`);
            }
            prompt();
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