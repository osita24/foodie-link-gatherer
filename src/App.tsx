import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./components/auth/AuthProvider";
import "./App.css";
import Index from "@/pages/Index";
import Saved from "@/pages/Saved";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/saved" element={<Saved />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;