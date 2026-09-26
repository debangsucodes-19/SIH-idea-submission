import { Router } from "express";
import { saveProfile } from "../controllers/profile.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const profileRouter = Router();
profileRouter.put("/", requireAuth, saveProfile);
