import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingSpinner } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="grid min-h-screen place-items-center"><LoadingSpinner label="Checking your sign-in"/></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }}/>;
  const profileComplete = Boolean(user.profile?.onboardingComplete);
  if (!profileComplete && location.pathname !== "/onboarding") return <Navigate to="/onboarding" replace/>;
  if (profileComplete && location.pathname === "/onboarding") return <Navigate to="/dashboard" replace/>;
  return <Outlet/>;
}
