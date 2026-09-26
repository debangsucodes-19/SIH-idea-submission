import type { Sport } from "../types";

export const sports: Sport[] = [
  { id: "football", name: "Football", description: "Build the speed, endurance, agility and balance needed on the pitch.", icon: "⚽", attributes: ["endurance", "agility", "strength", "speed", "balance", "mobility"], available: true },
  { id: "cricket", name: "Cricket", description: "A future sport profile for batting, bowling and fielding performance.", icon: "🏏", attributes: ["speed", "strength", "mobility", "coordination"], available: false },
  { id: "basketball", name: "Basketball", description: "A future profile focused on agility, jumping and explosive movement.", icon: "🏀", attributes: ["agility", "speed", "power", "balance"], available: false },
  { id: "tennis", name: "Tennis", description: "A future profile for movement, reaction and court performance.", icon: "🎾", attributes: ["agility", "speed", "coordination", "endurance"], available: false },
  { id: "athletics", name: "Athletics", description: "A future profile spanning running, jumping and throwing disciplines.", icon: "🏃", attributes: ["speed", "power", "endurance", "mobility"], available: false },
];
export const getSportById = (id: string) => sports.find((sport) => sport.id === id);
