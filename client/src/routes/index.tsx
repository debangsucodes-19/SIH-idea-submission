import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { PlaceholderPage } from "../pages/PlaceholderPage";

const placeholder=(title:string,description:string,phase?:string)=> <PlaceholderPage title={title} description={description} phase={phase}/>;
export const router=createBrowserRouter([
 {element:<PublicLayout/>,children:[{path:"/",element:<LandingPage/>},{path:"/login",element:<LoginPage/>}]},
 {element:<AppLayout/>,children:[
  {path:"/onboarding",element:placeholder("Your goals, your starting point","A simple introduction to capture your goals and preferred training direction. Profile setup will arrive in a later phase.","Phase 2")},
  {path:"/sports",element:placeholder("Find your sport","Football is our first focus, with more sport profiles planned for the future.")},
  {path:"/dashboard",element:<DashboardPage/>},
  {path:"/assessment",element:placeholder("Assessment","A future space for understanding your starting point and tracking athletic performance.","Future phase")},
  {path:"/workout",element:placeholder("Your training plan","Personalized workout plans will be introduced in a later phase.","Future phase")},
  {path:"/progress",element:placeholder("Progress","A future view of your milestones, consistency and performance over time.","Future phase")},
  {path:"/diet",element:placeholder("Nutrition","Personalized nutrition guidance will be introduced in a later phase.","Future phase")},
  {path:"/notifications",element:placeholder("Notifications","Updates and reminders will be introduced in a later phase.","Future phase")},
  {path:"/profile",element:placeholder("Your profile","Your account and personal training profile will be available in a later phase.","Phase 2")},
  {path:"/settings",element:placeholder("Settings","Preferences and account settings will be available in a later phase.","Phase 2")},
 ]},
 {path:"*",element:<PlaceholderPage title="Page not found" description="We couldn’t find the page you’re looking for." phase="404"/>}
]);
