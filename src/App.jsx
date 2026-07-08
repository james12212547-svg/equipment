import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useStore from './store/useStore';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import CategoryGrid from './pages/CategoryGrid';
import EquipmentDetail from './pages/EquipmentDetail';
import LearningHub from './pages/LearningHub';
import CalculatorsHub from './pages/CalculatorsHub';
import SolarCalculator from './pages/SolarCalculator';
import Quiz from './pages/Quiz';
import InteractiveSchematic from './pages/InteractiveSchematic';
import CompareTool from './pages/CompareTool';
import BtuCalculator from './pages/BtuCalculator';
import CableSizing from './pages/CableSizing';
import TroubleshootingSim from './pages/TroubleshootingSim';
import Glossary from './pages/Glossary';
import ModelViewer from './pages/ModelViewer';
import AIChatbot from './components/AIChatbot';
import Login from './pages/Login';
import WorkLog from './pages/WorkLog';
import PfcCalculator from './pages/PfcCalculator';
import VoltageDrop from './pages/VoltageDrop';
import LoadSchedule from './pages/LoadSchedule';
import LabLogger from './pages/LabLogger';
import Favorites from './pages/Favorites';
import Settings from './pages/Settings';
import MaintenanceSchedule from './pages/MaintenanceSchedule';
import CustomerHistory from './pages/CustomerHistory';
import Quotation from './pages/Quotation';
import Inventory from './pages/Inventory';
import RevenueDashboard from './pages/RevenueDashboard';
import TeamChat from './pages/TeamChat';
import MaintenanceReminders from './pages/MaintenanceReminders';
import ReloadPrompt from './components/ReloadPrompt';
import { requestNotificationPermission, scheduleAppointmentReminders } from './utils/notifications';

function App() {
  const isAuthenticated = useStore(state => state.isAuthenticated);
  const login = useStore(state => state.login);
  const loadCustomEquipment = useStore(state => state.loadCustomEquipment);
  const theme = useStore(state => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCustomEquipment();
      requestNotificationPermission();
    }
  }, [isAuthenticated, loadCustomEquipment]);

  // Schedule reminders whenever schedules change
  const schedules = useStore(state => state.schedules);
  useEffect(() => {
    if (isAuthenticated && schedules) {
      scheduleAppointmentReminders(schedules);
    }
  }, [schedules, isAuthenticated]);

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <Router>
      <Toaster position="bottom-right" toastOptions={{ style: { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' } }} />
      <ReloadPrompt />
      <div className="app-container" style={{ transition: 'background-color 0.3s ease, color 0.3s ease' }}>
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:categoryId" element={<CategoryGrid />} />
            <Route path="/equipment/:id" element={<EquipmentDetail />} />
            <Route path="/calculators" element={<CalculatorsHub />} />
            <Route path="/learning" element={<LearningHub />} />
            <Route path="/learning/calculator" element={<SolarCalculator />} />
            <Route path="/learning/quiz" element={<Quiz />} />
            <Route path="/learning/schematic" element={<InteractiveSchematic />} />
            <Route path="/learning/compare" element={<CompareTool />} />
            <Route path="/learning/btu" element={<BtuCalculator />} />
            <Route path="/learning/cable" element={<CableSizing />} />
            <Route path="/learning/simulator" element={<TroubleshootingSim />} />
            <Route path="/learning/glossary" element={<Glossary />} />
            <Route path="/learning/pfc" element={<PfcCalculator />} />
            <Route path="/learning/voltage-drop" element={<VoltageDrop />} />
            <Route path="/learning/load-schedule" element={<LoadSchedule />} />
            <Route path="/learning/3d" element={<ModelViewer />} />
            <Route path="/learning/lab-logger" element={<LabLogger />} />
            <Route path="/work-log" element={<WorkLog />} />
            <Route path="/schedule" element={<MaintenanceSchedule />} />
            <Route path="/customer-history" element={<CustomerHistory />} />
            <Route path="/quotation" element={<Quotation />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/revenue" element={<RevenueDashboard />} />
            <Route path="/team-chat" element={<TeamChat />} />
            <Route path="/reminders" element={<MaintenanceReminders />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <AIChatbot />
      </div>
    </Router>
  );
}

export default App;
