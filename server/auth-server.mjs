import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const PORT = 3001;
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const MAX_BODY_BYTES = 8 * 1024;
const scrypt = promisify(scryptCallback);
const databasePath = fileURLToPath(new URL("../db.json", import.meta.url));
const namePattern = /^[\p{L}\p{M}][\p{L}\p{M}' -]{0,49}$/u;
const emailPattern =
    /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

const allowedOrigins = new Set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]);

if (process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
    allowedOrigins.add(
        `https://${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`,
    );
}

// Demo sessions stay in memory and are cleared when the API restarts.
const sessions = new Map();

function sendJson(response, status, body, headers = {}) {
    response.writeHead(status, {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        ...headers,
    });
    response.end(JSON.stringify(body));
}

function setCorsHeaders(request, response) {
    const origin = request.headers.origin;
    if (origin && !allowedOrigins.has(origin)) {
        sendJson(response, 403, { error: "Origin is not allowed." });
        return false;
    }

    if (origin) {
        response.setHeader("Access-Control-Allow-Origin", origin);
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Vary", "Origin");
    }

    return true;
}

async function readJsonBody(request) {
    const chunks = [];
    let size = 0;

    for await (const chunk of request) {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) {
            return { error: "Request body is too large." };
        }
        chunks.push(chunk);
    }

    try {
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
        return { error: "Request body must be valid JSON." };
    }
}

function validateLogin(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return { error: "Enter valid login details." };
    }

    const { firstName, lastName, email, password } = body;
    if (
        typeof firstName !== "string" ||
        typeof lastName !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        return { error: "All fields are required." };
    }

    const normalized = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
    };

    if (!namePattern.test(normalized.firstName) || !namePattern.test(normalized.lastName)) {
        return { error: "Enter a valid first and last name." };
    }
    if (normalized.email.length > 254 || !emailPattern.test(normalized.email)) {
        return { error: "Enter a valid email address." };
    }
    if (
        normalized.password.length < 8 ||
        normalized.password.length > 128 ||
        !/[A-Za-z]/.test(normalized.password) ||
        !/\d/.test(normalized.password)
    ) {
        return { error: "Password must be 8–128 characters and include a letter and a number." };
    }

    return { value: normalized };
}

async function verifyPassword(password, passwordHash) {
    if (typeof passwordHash !== "string") {
        return false;
    }

    const [algorithm, salt, hash] = passwordHash.split(":");
    if (algorithm !== "scrypt" || !salt || !/^[a-f0-9]{128}$/i.test(hash ?? "")) {
        return false;
    }

    const expected = Buffer.from(hash, "hex");
    const actual = await scrypt(password, salt, expected.length);
    return timingSafeEqual(expected, actual);
}

function readSession(request) {
    const cookie = request.headers.cookie
        ?.split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("edp_session="));
    const token = cookie?.slice("edp_session=".length);
    const session = token ? sessions.get(token) : undefined;

    if (!session || session.expiresAt <= Date.now()) {
        if (token) {
            sessions.delete(token);
        }
        return null;
    }

    return session;
}

function sessionCookie(token, maxAge) {
    const secure = process.env.CODESPACE_NAME ? "; Secure" : "";
    return `edp_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

async function handleRequest(request, response) {
    if (!setCorsHeaders(request, response)) {
        return;
    }

    if (request.method === "OPTIONS") {
        response.writeHead(204, {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Max-Age": "600",
        });
        response.end();
        return;
    }

    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

    if (request.method === "GET" && url.pathname === "/api/users") {
        const database = JSON.parse(await readFile(databasePath, "utf8"));
        const users = database.users.map((user) => ({
            id: user.id,
            firstName: user.firstName ?? user.name ?? "",
            lastName: user.lastName ?? "",
            email: user.email,
        }));
        sendJson(response, 200, { users });
        return;
    }

    if (request.method === "GET" && url.pathname === "/api/session") {
        const session = readSession(request);
        if (!session) {
            sendJson(response, 401, { error: "Not signed in." });
            return;
        }
        sendJson(response, 200, { user: session.user });
        return;
    }

    if (request.method === "POST" && url.pathname === "/api/login") {
        if (!request.headers["content-type"]?.startsWith("application/json")) {
            sendJson(response, 415, { error: "Content-Type must be application/json." });
            return;
        }

        const body = await readJsonBody(request);
        if (body && typeof body === "object" && "error" in body) {
            sendJson(response, 400, { error: body.error });
            return;
        }

        const validation = validateLogin(body);
        if ("error" in validation) {
            sendJson(response, 400, validation);
            return;
        }

        const database = JSON.parse(await readFile(databasePath, "utf8"));
        const matchedUser = database.users.find((user) => {
            const firstName = user.firstName ?? user.name;
            const lastName = user.lastName ?? "";
            return (
                typeof firstName === "string" &&
                typeof lastName === "string" &&
                firstName.trim().toLocaleLowerCase() === validation.value.firstName.toLocaleLowerCase() &&
                lastName.trim().toLocaleLowerCase() === validation.value.lastName.toLocaleLowerCase() &&
                typeof user.email === "string" &&
                user.email.toLowerCase() === validation.value.email
            );
        });

        if (!matchedUser || !(await verifyPassword(validation.value.password, matchedUser.passwordHash))) {
            sendJson(response, 401, { error: "Name, email, or password is incorrect." });
            return;
        }

        const user = {
            firstName: matchedUser.firstName ?? matchedUser.name,
            lastName: matchedUser.lastName ?? "",
            email: matchedUser.email,
        };
        const token = randomBytes(32).toString("hex");
        sessions.set(token, {
            user,
            expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
        });

        sendJson(response, 200, { user }, {
            "Set-Cookie": sessionCookie(token, SESSION_TTL_SECONDS),
        });
        return;
    }

    if (request.method === "POST" && url.pathname === "/api/logout") {
        if (!request.headers["content-type"]?.startsWith("application/json")) {
            sendJson(response, 415, { error: "Content-Type must be application/json." });
            return;
        }

        const session = readSession(request);
        if (session) {
            const cookie = request.headers.cookie
                ?.split(";")
                .map((part) => part.trim())
                .find((part) => part.startsWith("edp_session="));
            const token = cookie?.slice("edp_session=".length);
            if (token) {
                sessions.delete(token);
            }
        }
        sendJson(response, 200, { ok: true }, {
            "Set-Cookie": sessionCookie("", 0),
        });
        return;
    }

    sendJson(response, 404, { error: "Endpoint not found." });
}

const server = createServer((request, response) => {
    void handleRequest(request, response).catch((error) => {
        console.error("Authentication API request failed:", error);
        if (!response.headersSent) {
            sendJson(response, 500, { error: "Authentication service is unavailable." });
        } else {
            response.end();
        }
    });
});

server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.error(`Authentication API port ${PORT} is already in use.`);
    } else {
        console.error("Could not start the authentication API:", error);
    }
    process.exitCode = 1;
});

server.listen(PORT, "0.0.0.0", () => {
    const codespaceName = process.env.CODESPACE_NAME;
    const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
    const endpoint = codespaceName && domain
        ? `https://${codespaceName}-${PORT}.${domain}`
        : `http://localhost:${PORT}`;
    console.log(`Authentication API listening at ${endpoint}`);
});
