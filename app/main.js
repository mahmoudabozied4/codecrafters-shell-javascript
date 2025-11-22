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

function parseArgs(input) {
    const args = [];
    let current = "";
    let i = 0;

    let inSingle = false;
    let inDouble = false;
    let escapeNext = false;

    while (i < input.length) {
        const c = input[i];
        // HANDLE BACKSLASH OUTSIDE QUOTES

        if (!inSingle && !inDouble && c === "\\" && !escapeNext) {
            // Escape the next character literally
            escapeNext = true;
            i++;
            continue;
        }

        if (escapeNext) {
            // Literal next character
            current += c;
            escapeNext = false;
            i++;
            continue;
        }

        // INSIDE SINGLE QUOTES
        if (inSingle) {
            if (c === "'") {
                inSingle = false;
            } else {
                current += c;
            }
            i++;
            continue;
        }

        // INSIDE DOUBLE QUOTES
        if (inDouble) {
            if (c === "\\") {
                const next = input[i + 1];

                if (next === '"' || next === "\\") {
                    // Only \" and \\ are escaped in this stage
                    current += next;
                    i += 2;
                } else {
                    // Backslash is literal
                    current += "\\";
                    i++;
                }
            }
            else if (c === '"') {
                inDouble = false;
                i++;
            }
            else {
                current += c;
                i++;
            }
            continue;
        }


        // OUTSIDE QUOTES
        if (c === "'") {
            inSingle = true;
        }
        else if (c === '"') {
            inDouble = true;
        }
        else if (/\s/.test(c)) {
            // whitespace ends an argument
            if (current.length > 0) {
                args.push(current);
                current = "";
            }
        }
        else {
            current += c;
        }

        i++;
    }

    // leftover escape at end: treat "\" as literal
    if (escapeNext) {
        current += "\\";
    }

    if (current.length > 0) {
        args.push(current);
    }

    return args;
}

function prompt() {
    rl.question("$ ", (answer) => {
        let ans = answer.trim();

        if (ans === "") {
            prompt();
            return;
        }

        const parts = parseArgs(ans);
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
            if (!target) {
                // Do nothing silently
                prompt();
                return;
            }
            let newPath;

            if (target === "~") {
                const home = process.env.HOME;
                newPath = home;
            }
            else if (target.startsWith("/")) {
                newPath = target;
            } else {
                newPath = path.resolve(process.cwd(), target);
            }
            try {
                process.chdir(newPath);
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
