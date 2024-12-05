import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import RestaurantDetails from "@/pages/RestaurantDetails";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
      </Routes>
    </Router>
  );
};

export default App;