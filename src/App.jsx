import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import LandingPage from "./pages/LandingPage";
import MonthlyResultPage from "./pages/monthlyResultPage";
import YearlyResultPage from "./pages/YearlyResultPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/:year/:month" element={<MonthlyResultPage />} />
        <Route path="/year" element={<YearlyResultPage />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;