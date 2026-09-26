import type { RequestHandler } from "express";
import { pool, ensureSchema } from "../config/database.js";

const goals = new Set(["general-fitness", "muscle-gain", "fat-loss", "sports-performance", "endurance", "strength"]);
const sports = new Set(["football"]);

export const saveProfile: RequestHandler = async (request, response, next) => {
  try {
    const { age, height, weight, fitnessGoal, selectedSportId } = request.body as Record<string, unknown>;
    if (!Number.isInteger(age) || Number(age) < 13 || Number(age) > 100) { response.status(400).json({ message: "Age must be between 13 and 100." }); return; }
    if (typeof height !== "number" || height < 100 || height > 250) { response.status(400).json({ message: "Height must be between 100 and 250 cm." }); return; }
    if (typeof weight !== "number" || weight < 25 || weight > 300) { response.status(400).json({ message: "Weight must be between 25 and 300 kg." }); return; }
    if (typeof fitnessGoal !== "string" || !goals.has(fitnessGoal)) { response.status(400).json({ message: "Choose a valid fitness goal." }); return; }
    if (typeof selectedSportId !== "string" || !sports.has(selectedSportId)) { response.status(400).json({ message: "Choose an available sport." }); return; }
    if (!pool) { response.status(503).json({ message: "PostgreSQL is not configured." }); return; }
    await ensureSchema();
    await pool.query("UPDATE user_profiles SET age = $2, height_cm = $3, weight_kg = $4, fitness_goal = $5, selected_sport_id = $6, onboarding_complete = TRUE, updated_at = NOW() WHERE user_id = $1", [request.authUserId, age, height, weight, fitnessGoal, selectedSportId]);
    response.json({ success: true });
  } catch (error) { next(error); }
};
