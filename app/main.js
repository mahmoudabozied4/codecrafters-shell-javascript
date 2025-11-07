const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// TODO: Uncomment the code below to pass the first stage
function prompt () {
    rl.question("$ ", (answer) => {
        if (answer === "exit 0") {
            rl.close();
            return;
        }
        console.log(`${answer}: command not found`) ;
        prompt();
    });
}

prompt();