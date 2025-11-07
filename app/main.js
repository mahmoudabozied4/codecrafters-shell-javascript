const readline = require("readline");
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function isExecutable(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.X_OK);
        return true;
    } catch {
        return false;
    }
}

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
        if (ans === "exit" || ans === "exit 0") {
            rl.close();
            return;
        }

        // type command
        if (ans.startsWith("type ")) {
            const arg = ans.slice(5).trim();

            // Builtins
            if (["echo", "exit", "type"].includes(arg)) {
                console.log(`${arg} is a shell builtin`);
                prompt();
                return;
            }

            const pathDirs = process.env.PATH.split(path.delimiter);

            // Search in PATH
            for (const dir of pathDirs) {
                const fullPath = path.join(dir, arg);
                if (fs.existsSync(fullPath) && isExecutable(fullPath)) {
                    console.log(`${arg} is ${fullPath}`);
                    prompt();
                    return;
                }
            }

            console.log(`${arg}: not found`);
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