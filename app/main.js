const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// TODO: Uncomment the code below to pass the first stage
function prompt () {
    rl.question("$ ", (answer) => {
        let ans = answer.trim();
        if (ans.startsWith('echo ')){
            console.log(ans.slice(5));
            prompt();
            return;
        }
        if (ans === "exit 0") {
            return;
        }
        console.log(`${answer}: command not found`) ;
        prompt();
    });
}

prompt();