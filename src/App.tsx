import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RestaurantDetails from "./pages/RestaurantDetails";
import { Toaster } from "./components/ui/toaster";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;