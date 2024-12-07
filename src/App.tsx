import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import Saved from "@/pages/Saved";
import Onboarding from "@/pages/Onboarding";
import RestaurantDetails from "@/pages/RestaurantDetails";

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        </Routes>
      </Router>
    </SessionContextProvider>
  );
}

export default App;