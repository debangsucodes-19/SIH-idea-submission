export type FitnessGoal = "general-fitness" | "muscle-gain" | "fat-loss" | "sports-performance" | "endurance" | "strength";
export interface User { id: string; email: string; name: string; pictureUrl?: string | null; profile?: UserProfile }
export interface UserProfile { age?: number; height?: number; weight?: number; gender?: string; fitnessGoal?: FitnessGoal; selectedSportId?: string; onboardingComplete?: boolean }
export interface Sport { id: string; name: string; description: string; icon: string; attributes: string[]; available: boolean }
export interface Assessment { id: string; userId: string; sportId: string; score?: number; completedAt?: string }
export interface Exercise { id: string; name: string; description?: string; category?: string; difficulty?: "beginner" | "intermediate" | "advanced" }
export interface WorkoutPlan { id: string; userId: string; name: string; exercises: Exercise[]; durationMinutes?: number }
export interface DietPlan { id: string; userId: string; calories?: number; meals: string[] }
export interface ProgressRecord { id: string; userId: string; date: string; metric: string; value: number; unit?: string }
export interface Notification { id: string; userId: string; title: string; message: string; read: boolean; createdAt: string }
