import fs from "node:fs";
import path from "node:path";

const envFile = path.resolve(".env.production");

const readProductionEnvFile = () => {
    if (!fs.existsSync(envFile)) {
        return {};
    }

    return Object.fromEntries(
        fs.readFileSync(envFile, "utf8")
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith("#"))
            .map((line) => {
                const separatorIndex = line.indexOf("=");
                if (separatorIndex === -1) {
                    return [line, ""];
                }
                return [
                    line.slice(0, separatorIndex).trim(),
                    line.slice(separatorIndex + 1).trim()
                ];
            })
    );
};

const fileEnv = readProductionEnvFile();
const apiBaseUrl = process.env.VITE_API_BASE_URL || fileEnv.VITE_API_BASE_URL || "";

if (!apiBaseUrl) {
    console.error("VITE_API_BASE_URL is required for production builds.");
    console.error("Set it in Amplify Hosting environment variables to the deployed Spring Boot API URL.");
    process.exit(1);
}

if (/localhost|127\.0\.0\.1/.test(apiBaseUrl)) {
    console.error("VITE_API_BASE_URL cannot point to localhost for production builds.");
    process.exit(1);
}

if (/amplifyapp\.com/.test(apiBaseUrl)) {
    console.error("VITE_API_BASE_URL is pointing at the frontend. It must point at the Spring Boot API.");
    process.exit(1);
}

try {
    const url = new URL(apiBaseUrl);
    if (url.protocol !== "https:") {
        console.error("VITE_API_BASE_URL must be HTTPS when the frontend is hosted on Amplify.");
        process.exit(1);
    }
} catch {
    console.error("VITE_API_BASE_URL must be a valid absolute URL.");
    process.exit(1);
}
