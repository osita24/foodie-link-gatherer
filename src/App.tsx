import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import Saved from "@/pages/Saved";
import RestaurantDetails from "@/pages/RestaurantDetails";
import Navigation from "@/components/Navigation";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col md:flex-row bg-background">
        <Navigation />
        <main className="flex-1 pb-20 md:pb-0 md:pl-64">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;