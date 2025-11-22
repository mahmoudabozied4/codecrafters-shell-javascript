const readline = require("readline");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

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

function findExecutable(cmd) {
    const pathDirs = process.env.PATH.split(path.delimiter);

    for (const dir of pathDirs) {
        const fullPath = path.join(dir, cmd);
        if (fs.existsSync(fullPath) && isExecutable(fullPath)) {
            return fullPath;
        }
    }
    return null;
}

function prompt() {
    rl.question("$ ", (answer) => {
        let ans = answer.trim();
        const parts = ans.split(/\s+/);
        const cmd = parts[0];
        const args = parts.slice(1);

        // empty input
        if (ans === "") {
            prompt();
            return;
        }

        // echo command
        if (cmd === "echo") {
            console.log(parts.slice(1).join(" "));
            prompt();
            return;
        }

        // exit command
        if (cmd === "exit") {
            rl.close();
            return;
        }

        // type command
        if (cmd === "type") {
            const arg = args[0];

            if (!arg) {
                prompt();
                return;
            }

            // Builtins
            if (["echo", "exit", "type"].includes(arg)) {
                console.log(`${arg} is a shell builtin`);
                prompt();
                return;
            }

            // Search PATH
            const found = findExecutable(arg);
            if (found) {
                console.log(`${arg} is ${found}`);
            } else {
                console.log(`${arg}: not found`);
            }

            prompt();
            return;
        }

        // Try to run external executable
        const executable = findExecutable(cmd);

        if (executable) {
            const child = spawn(executable, args, { stdio: "inherit" });

            child.on("exit", () => {
                prompt();
            });

            return;
        }

        // unknown command
        console.log(`${cmd}: command not found`);
        prompt();
    });
}

prompt();
