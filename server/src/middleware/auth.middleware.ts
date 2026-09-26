import type { RequestHandler } from "express";
import { jwtVerify } from "jose";
import { env } from "../config/env.js";

export const SESSION_COOKIE = "strive_session";
const secret = () => new TextEncoder().encode(env.sessionSecret);

function readCookie(request: Parameters<RequestHandler>[0], name: string): string | undefined {
  const cookies = request.headers.cookie?.split(";") ?? [];
  const entry = cookies.map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : undefined;
}

export async function getSessionUserId(request: Parameters<RequestHandler>[0]): Promise<string | null> {
  if (!env.sessionSecret || env.sessionSecret.length < 32) return null;
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, secret()); return typeof payload.sub === "string" ? payload.sub : null; }
  catch { return null; }
}

export const requireAuth: RequestHandler = (request, response, next) => {
  void getSessionUserId(request).then((userId) => {
    if (!userId) { response.status(401).json({ success: false, message: "Sign in to continue." }); return; }
    request.authUserId = userId;
    next();
  }).catch(next);
};
