import { spawn } from "node:child_process";

const children = [
    spawn(process.execPath, ["server/auth-server.mjs"], { stdio: "inherit" }),
    spawn("npm", [
        "run",
        "start:site",
        "--",
        "--host",
        "0.0.0.0",
        "--port",
        "3000",
    ], { stdio: "inherit" }),
];

let stopping = false;

function stopChildren(signal) {
    if (stopping) {
        return;
    }
    stopping = true;
    for (const child of children) {
        if (child.exitCode === null && child.signalCode === null) {
            child.kill(signal);
        }
    }
}

for (const child of children) {
    child.on("error", (error) => {
        console.error("Could not start the development service:", error);
        process.exitCode = 1;
        stopChildren("SIGTERM");
    });
    child.on("exit", (code) => {
        if (!stopping) {
            process.exitCode = code ?? 1;
            stopChildren("SIGTERM");
        }
    });
}

process.on("SIGINT", () => stopChildren("SIGINT"));
process.on("SIGTERM", () => stopChildren("SIGTERM"));
