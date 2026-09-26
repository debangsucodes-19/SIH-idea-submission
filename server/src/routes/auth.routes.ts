import { Router } from "express";
import { getAuthStatus, getCurrentUser, finishGoogleAuth, signOut, startGoogleAuth } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const authRouter = Router();
authRouter.get("/status", getAuthStatus);
authRouter.get("/google", startGoogleAuth);
authRouter.get("/google/callback", finishGoogleAuth);
authRouter.get("/me", requireAuth, getCurrentUser);
authRouter.post("/logout", signOut);
