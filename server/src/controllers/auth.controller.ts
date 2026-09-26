import { randomBytes, timingSafeEqual, randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { OAuth2Client } from "google-auth-library";
import { SignJWT } from "jose";
import { pool, ensureSchema, checkDatabase } from "../config/database.js";
import { env, oauthConfigured, sessionConfigured } from "../config/env.js";
import { SESSION_COOKIE, getSessionUserId } from "../middleware/auth.middleware.js";

const oauth = new OAuth2Client(env.googleClientId, env.googleClientSecret, env.googleCallbackUrl);
const secret = () => new TextEncoder().encode(env.sessionSecret);
const cookieOptions = { httpOnly: true, secure: env.nodeEnv === "production", sameSite: "lax" as const, path: "/", maxAge: 7 * 24 * 60 * 60 * 1000 };
const stateCookieOptions = { ...cookieOptions, path: "/api/auth/google/callback", maxAge: 5 * 60 * 1000 };
const callbackError = (response: Parameters<RequestHandler>[1], error: string) => response.redirect(`${env.clientUrl}/login?error=${encodeURIComponent(error)}`);
function readCookie(request: Parameters<RequestHandler>[0], name: string): string | undefined {
  const entry = request.headers.cookie?.split(";").map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : undefined;
}

export const getAuthStatus: RequestHandler = async (_request, response, next) => {
  try { const databaseConfigured = await checkDatabase(); const ready = oauthConfigured && sessionConfigured && databaseConfigured; response.json({ ready, googleConfigured: oauthConfigured, databaseConfigured }); }
  catch (error) { next(error); }
};

export const startGoogleAuth: RequestHandler = (_request, response) => {
  if (!oauthConfigured || !sessionConfigured || !env.databaseUrl) { callbackError(response, "oauth_not_configured"); return; }
  const state = randomBytes(32).toString("base64url");
  response.cookie("strive_oauth_state", state, stateCookieOptions);
  response.redirect(oauth.generateAuthUrl({ response_type: "code", scope: ["openid", "email", "profile"], state }));
};

export const finishGoogleAuth: RequestHandler = async (request, response) => {
  const code = typeof request.query.code === "string" ? request.query.code : "";
  const receivedState = typeof request.query.state === "string" ? request.query.state : "";
  const expectedState = readCookie(request, "strive_oauth_state");
  response.clearCookie("strive_oauth_state", stateCookieOptions);
  if (!oauthConfigured || !sessionConfigured || !env.databaseUrl) { callbackError(response, "oauth_not_configured"); return; }
  if (!code || !receivedState || !expectedState) { callbackError(response, "oauth_state_invalid"); return; }
  const expected = Buffer.from(decodeURIComponent(expectedState)); const received = Buffer.from(receivedState);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) { callbackError(response, "oauth_state_invalid"); return; }
  try {
    const { tokens } = await oauth.getToken(code);
    if (!tokens.id_token) { callbackError(response, "oauth_failed"); return; }
    const ticket = await oauth.verifyIdToken({ idToken: tokens.id_token, audience: env.googleClientId });
    const identity = ticket.getPayload();
    if (!identity?.sub || !identity.email || !identity.email_verified) { callbackError(response, "oauth_failed"); return; }
    if (!pool) { callbackError(response, "oauth_not_configured"); return; }
    await ensureSchema();
    const userId = randomUUID();
    const result = await pool.query<{ id: string; onboarding_complete: boolean }>(`
      INSERT INTO users (id, google_subject, email, name, picture_url)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (google_subject) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, picture_url = EXCLUDED.picture_url, updated_at = NOW()
      RETURNING id, (SELECT onboarding_complete FROM user_profiles WHERE user_id = users.id) AS onboarding_complete
    `, [userId, identity.sub, identity.email, identity.name ?? identity.email, identity.picture ?? null]);
    const user = result.rows[0];
    if (!user) { callbackError(response, "oauth_failed"); return; }
    await pool.query("INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING", [user.id]);
    const session = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt().setExpirationTime("7d").sign(secret());
    response.cookie(SESSION_COOKIE, session, cookieOptions);
    response.redirect(`${env.clientUrl}/${user.onboarding_complete ? "dashboard" : "onboarding"}`);
  } catch (error) {
    console.error("Google sign-in failed:", error instanceof Error ? error.message : "unknown error");
    callbackError(response, "oauth_failed");
  }
};

export const getCurrentUser: RequestHandler = async (request, response, next) => {
  try {
    const userId = await getSessionUserId(request);
    if (!userId) { response.status(401).json({ success: false, message: "Sign in to continue." }); return; }
    if (!pool) { response.status(503).json({ success: false, message: "PostgreSQL is not configured." }); return; }
    await ensureSchema();
    const result = await pool.query(`SELECT u.id, u.email, u.name, u.picture_url AS "pictureUrl", p.age, p.height_cm AS height, p.weight_kg AS weight, p.fitness_goal AS "fitnessGoal", p.selected_sport_id AS "selectedSportId", p.onboarding_complete AS "onboardingComplete" FROM users u JOIN user_profiles p ON p.user_id = u.id WHERE u.id = $1`, [userId]);
    if (!result.rows[0]) { response.clearCookie(SESSION_COOKIE, cookieOptions); response.status(401).json({ success: false, message: "Sign-in session has expired." }); return; }
    response.json({ user: { ...result.rows[0], profile: { age: result.rows[0].age ?? undefined, height: result.rows[0].height ? Number(result.rows[0].height) : undefined, weight: result.rows[0].weight ? Number(result.rows[0].weight) : undefined, fitnessGoal: result.rows[0].fitnessGoal ?? undefined, selectedSportId: result.rows[0].selectedSportId ?? undefined, onboardingComplete: result.rows[0].onboardingComplete } } });
  } catch (error) { next(error); }
};

export const signOut: RequestHandler = (_request, response) => { response.clearCookie(SESSION_COOKIE, cookieOptions); response.json({ success: true }); };
