import { useAuth } from "../hooks/useAuth";
import { Badge, Card } from "../components/ui";
import { getSportById } from "../config/sports";

export function ProfilePage() {
  const { user } = useAuth();
  const sport = user?.profile?.selectedSportId ? getSportById(user.profile.selectedSportId) : undefined;
  const details = [["Email", user?.email], ["Sport", sport ? `${sport.icon} ${sport.name}` : "Not selected"], ["Primary goal", user?.profile?.fitnessGoal?.replaceAll("-", " ")], ["Age", user?.profile?.age ? `${user.profile.age} years` : undefined], ["Height", user?.profile?.height ? `${user.profile.height} cm` : undefined], ["Weight", user?.profile?.weight ? `${user.profile.weight} kg` : undefined]] as const;
  return <div className="space-y-7"><div><Badge>Personal details</Badge><h1 className="mt-4 text-3xl font-semibold tracking-tight">Your profile</h1><p className="mt-2 text-sm text-slate-600">Your sign-in identity and training preferences.</p></div><Card className="p-6 sm:p-8"><div className="flex items-center gap-4 border-b border-slate-100 pb-6"><div className="grid h-14 w-14 place-items-center rounded-full bg-lime-200 text-xl font-semibold">{user?.name.slice(0,1).toUpperCase()}</div><div><h2 className="font-semibold">{user?.name}</h2><p className="mt-1 text-sm text-slate-500">Google account</p></div></div><dl className="grid gap-5 pt-6 sm:grid-cols-2">{details.map(([label,value])=><div key={label}><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1.5 text-sm font-semibold capitalize">{value ?? "Not set"}</dd></div>)}</dl></Card></div>;
}
