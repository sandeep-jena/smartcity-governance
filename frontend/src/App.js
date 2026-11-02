import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage          from './pages/LandingPage.jsx';
import LoginPage            from './pages/LoginPage.jsx';
import RegisterPage         from './pages/RegisterPage.jsx';
import DashboardPage        from './pages/DashboardPage.jsx';
import SubmitComplaintPage  from './pages/SubmitComplaintPage.jsx';
import MyComplaintsPage     from './pages/MyComplaintsPage.jsx';
import AdminDashboardPage   from './pages/AdminDashboardPage.jsx';
import OfficerDashboardPage from './pages/OfficerDashboardPage.jsx';
import MapViewPage          from './pages/MapViewPage.jsx';
import UsersPage            from './pages/UsersPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<LandingPage />} />
        <Route path="/login"      element={<LoginPage />} />
        <Route path="/register"   element={<RegisterPage />} />
        <Route path="/dashboard"  element={<DashboardPage />} />
        <Route path="/submit"     element={<SubmitComplaintPage />} />
        <Route path="/complaints" element={<MyComplaintsPage />} />
        <Route path="/admin"      element={<AdminDashboardPage />} />
        <Route path="/officer"    element={<OfficerDashboardPage />} />
        <Route path="/map"        element={<MapViewPage />} />
        <Route path="/users"      element={<UsersPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;