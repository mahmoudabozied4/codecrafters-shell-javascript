const readline = require("readline");
const fs = require("fs");
const path = require("path");
const {spawn} = require("child_process");

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

        if (ans === "") {
            prompt();
            return;
        }

        const parts = ans.split(/\s+/);
        const cmd = parts[0];
        const args = parts.slice(1);

        // echo builtin
        if (cmd === "echo") {
            console.log(args.join(" "));
            prompt();
            return;
        }

        // exit builtin
        if (cmd === "exit") {
            rl.close();
            return;
        }

        // cmd builtin
        if (cmd === "pwd") {
            console.log(process.cwd());
            prompt();
            return;
        }

        if (cmd === "cd") {
            const target = args[0];
            if (!target || !target.startsWith("/")) {
                // Do nothing silently
                prompt();
                return;
            }
            try {
                process.chdir(target);
            } catch {
                console.log(`cd: ${target}: No such file or directory`);
            }
            prompt();
            return;
        }

        // type builtin
        if (cmd === "type") {
            const arg = args[0];

            if (!arg) {
                prompt();
                return;
            }

            // Builtins
            if (["echo", "exit", "type", "pwd", "cd"].includes(arg)) {
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

        // External program execution
        const executable = findExecutable(cmd);

        if (executable) {
            const child = spawn(executable, args, {
                stdio: "inherit",
                argv0: cmd
            });

            child.on("exit", () => {
                prompt();
            });

            return;
        }

        // Unknown command
        console.log(`${cmd}: command not found`);
        prompt();
    });
}

prompt();
