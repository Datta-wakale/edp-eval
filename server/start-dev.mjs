import { spawn } from "node:child_process";

async function isResponding(url, expectedStatus) {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
        return response.status === expectedStatus;
    } catch {
        return false;
    }
}

const [apiAlreadyRunning, siteAlreadyRunning] = await Promise.all([
    isResponding("http://127.0.0.1:3001/api/session", 401),
    isResponding("http://127.0.0.1:3000/login", 200),
]);

const children = [];

if (apiAlreadyRunning) {
    console.log("Authentication API is already running at http://localhost:3001.");
} else {
    children.push(
        spawn(process.execPath, ["server/auth-server.mjs"], { stdio: "inherit" }),
    );
}

if (siteAlreadyRunning) {
    console.log("Login page is already running at http://localhost:3000/login.");
} else {
    children.push(
        spawn("npm", [
            "run",
            "start:site",
            "--",
            "--host",
            "0.0.0.0",
            "--port",
            "3000",
        ], { stdio: "inherit" }),
    );
}

if (children.length === 0) {
    console.log("The feature app is already running; open http://localhost:3000/login.");
    process.exit(0);
}

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
