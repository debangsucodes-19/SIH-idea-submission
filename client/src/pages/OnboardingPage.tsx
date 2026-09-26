import { useState, type FormEvent } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sports } from "../config/sports";
import { Button, Card, ErrorMessage, Input, Select } from "../components/ui";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import type { FitnessGoal } from "../types";

export function OnboardingPage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const current = user?.profile;
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSaving(true);
    const data = new FormData(event.currentTarget);
    const profile = { age: Number(data.get("age")), height: Number(data.get("height")), weight: Number(data.get("weight")), fitnessGoal: String(data.get("fitnessGoal")) as FitnessGoal, selectedSportId: String(data.get("selectedSportId")), onboardingComplete: true };
    try { await api.profile.save(profile); updateProfile(profile); navigate("/dashboard", { replace: true }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save your profile. Please try again."); }
    finally { setSaving(false); }
  }
  return <main className="mx-auto grid min-h-screen max-w-5xl place-items-center px-5 py-12"><Card className="w-full max-w-3xl overflow-hidden"><div className="bg-slate-950 px-7 py-8 text-white sm:px-10"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime-300 text-slate-950"><Sparkles/></span><p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-lime-300">A good place to start</p><h1 className="mt-2 text-3xl font-semibold">Let’s make this yours, {user?.name.split(" ")[0]}.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Tell us a little about your goals and the sport you want to focus on. You can update this later.</p></div><form onSubmit={handleSubmit} className="grid gap-5 p-7 sm:grid-cols-2 sm:p-10"><Input id="age" name="age" type="number" min="13" max="100" label="Age" placeholder="Your age" defaultValue={current?.age} required/><Input id="height" name="height" type="number" min="100" max="250" label="Height (cm)" placeholder="e.g. 172" defaultValue={current?.height} required/><Input id="weight" name="weight" type="number" min="25" max="300" step="0.1" label="Weight (kg)" placeholder="e.g. 68" defaultValue={current?.weight} required/><Select id="fitnessGoal" name="fitnessGoal" label="Main goal" defaultValue={current?.fitnessGoal ?? "sports-performance"}><option value="sports-performance">Improve sports performance</option><option value="general-fitness">Build general fitness</option><option value="strength">Build strength</option><option value="endurance">Improve endurance</option><option value="muscle-gain">Gain muscle</option><option value="fat-loss">Lose body fat</option></Select><div className="sm:col-span-2"><Select id="selectedSportId" name="selectedSportId" label="First sport" defaultValue={current?.selectedSportId ?? "football"}>{sports.filter((sport) => sport.available).map((sport) => <option key={sport.id} value={sport.id}>{sport.icon} {sport.name}</option>)}</Select><p className="mt-2 text-xs text-slate-500">Football is available first. More sports are planned.</p></div>{error && <div className="sm:col-span-2"><ErrorMessage message={error}/></div>}<div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 sm:col-span-2"><p className="text-xs text-slate-500">Your information is saved to your profile.</p><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save and continue"} <ArrowRight size={16}/></Button></div></form></Card></main>;
}
