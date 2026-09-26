import "dotenv/config";

function parsePort(value: string | undefined): number { const port = Number(value ?? 5000); if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be a valid TCP port."); return port; }
export const env = { port: parsePort(process.env.PORT), nodeEnv: process.env.NODE_ENV ?? "development", clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173" };
