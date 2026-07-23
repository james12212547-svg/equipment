import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import CableSizing from './pages/CableSizing';
import TroubleshootingSim from './pages/TroubleshootingSim';
import Glossary from './pages/Glossary';
import ModelViewer from './pages/ModelViewer';
import Login from './pages/Login';
import WorkLog from './pages/WorkLog';
import PfcCalculator from './pages/PfcCalculator';
import VoltageDrop from './pages/VoltageDrop';
import LoadSchedule from './pages/LoadSchedule';
import LightingCalculator from './pages/LightingCalculator';
import ConduitSizing from './pages/ConduitSizing';
import MotorCalculator from './pages/MotorCalculator';
import AirConCalculator from './pages/AirConCalculator';
import ProjectDashboard from './pages/ProjectDashboard';
import ProjectWorkspace from './pages/ProjectWorkspace';
import LabLogger from './pages/LabLogger';
import Favorites from './pages/Favorites';
import Settings from './pages/Settings';
import MaintenanceSchedule from './pages/MaintenanceSchedule';
import CustomerHistory from './pages/CustomerHistory';
import Quotation from './pages/Quotation';
import Invoice from './pages/Invoice';
import Inventory from './pages/Inventory';
import RevenueDashboard from './pages/RevenueDashboard';
import TeamChat from './pages/TeamChat';
import MaintenanceReminders from './pages/MaintenanceReminders';
import Notifications from './pages/Notifications';
import AIDiagnostic from './pages/AIDiagnostic';
import SingleLineDiagram from './pages/SingleLineDiagram';
import Solar3DSimulator from './pages/Solar3DSimulator';
import GamifiedSimulator from './pages/GamifiedSimulator';
import ReloadPrompt from './components/ReloadPrompt';
import { requestNotificationPermission, scheduleAppointmentReminders } from './utils/notifications';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, userRole, loading } = useAuth();
  
  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Login />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><h2>Access Denied</h2><p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p></div>;
  }

  return children;
};

function AppContent() {
  const { currentUser } = useAuth();
  const loadCustomEquipment = useStore(state => state.loadCustomEquipment);
  const loadSchedules = useStore(state => state.loadSchedules);
  const loadProjects = useStore(state => state.loadProjects);
  const loadNotifications = useStore(state => state.loadNotifications);
  const theme = useStore(state => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      loadCustomEquipment();
      loadSchedules();
      loadProjects();
      loadNotifications(currentUser.email);
      requestNotificationPermission();
    } else {
      loadNotifications(null);
    }
  }, [currentUser, loadCustomEquipment, loadSchedules, loadProjects, loadNotifications]);

  // Schedule reminders whenever schedules change
  const schedules = useStore(state => state.schedules);
  useEffect(() => {
    if (currentUser && schedules) {
      scheduleAppointmentReminders(schedules);
    }
  }, [schedules, currentUser]);

  return (
    <Router>
      <Toaster position="bottom-right" toastOptions={{ style: { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' } }} />
      <ReloadPrompt />
      <div className="app-container" style={{ transition: 'background-color 0.3s ease, color 0.3s ease' }}>
        <div className="animated-bg"></div>
        {currentUser && <Navigation />}
        <main className="main-content" style={{ paddingLeft: currentUser ? undefined : '0' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Public/All Users */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/category/:categoryId" element={<ProtectedRoute><CategoryGrid /></ProtectedRoute>} />
            <Route path="/equipment/:id" element={<ProtectedRoute><EquipmentDetail /></ProtectedRoute>} />
            <Route path="/calculators" element={<ProtectedRoute><CalculatorsHub /></ProtectedRoute>} />
            <Route path="/learning" element={<ProtectedRoute><LearningHub /></ProtectedRoute>} />
            <Route path="/learning/calculator" element={<ProtectedRoute><SolarCalculator /></ProtectedRoute>} />
            <Route path="/learning/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/learning/schematic" element={<ProtectedRoute><InteractiveSchematic /></ProtectedRoute>} />
            <Route path="/learning/compare" element={<ProtectedRoute><CompareTool /></ProtectedRoute>} />
            <Route path="/learning/btu" element={<ProtectedRoute><AirConCalculator /></ProtectedRoute>} />
            <Route path="/learning/cable" element={<ProtectedRoute><CableSizing /></ProtectedRoute>} />
            <Route path="/learning/simulator" element={<ProtectedRoute><TroubleshootingSim /></ProtectedRoute>} />
            <Route path="/learning/glossary" element={<ProtectedRoute><Glossary /></ProtectedRoute>} />
            <Route path="/learning/pfc" element={<ProtectedRoute><PfcCalculator /></ProtectedRoute>} />
            <Route path="/learning/voltage-drop" element={<ProtectedRoute><VoltageDrop /></ProtectedRoute>} />
            <Route path="/learning/load-schedule" element={<ProtectedRoute><LoadSchedule /></ProtectedRoute>} />
            <Route path="/learning/lighting" element={<ProtectedRoute><LightingCalculator /></ProtectedRoute>} />
            <Route path="/learning/conduit" element={<ProtectedRoute><ConduitSizing /></ProtectedRoute>} />
            <Route path="/learning/motor" element={<ProtectedRoute><MotorCalculator /></ProtectedRoute>} />
            <Route path="/learning/sld" element={<ProtectedRoute><SingleLineDiagram /></ProtectedRoute>} />
            <Route path="/learning/solar-3d" element={<ProtectedRoute><Solar3DSimulator /></ProtectedRoute>} />
            <Route path="/learning/game-sim" element={<ProtectedRoute><GamifiedSimulator /></ProtectedRoute>} />
            <Route path="/learning/3d" element={<ProtectedRoute><ModelViewer /></ProtectedRoute>} />
            <Route path="/work-log" element={<ProtectedRoute><WorkLog /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><ProjectDashboard /></ProtectedRoute>} />
            <Route path="/project/:id" element={<ProtectedRoute><ProjectWorkspace /></ProtectedRoute>} />
            <Route path="/learning/lab-logger" element={<ProtectedRoute><LabLogger /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><MaintenanceSchedule /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/team-chat" element={<ProtectedRoute><TeamChat /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/reminders" element={<ProtectedRoute><MaintenanceReminders /></ProtectedRoute>} />
            <Route path="/ai-diagnostic" element={<ProtectedRoute><AIDiagnostic /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            {/* Admin Only */}
            <Route path="/quotation" element={<ProtectedRoute allowedRoles={['admin']}><Quotation /></ProtectedRoute>} />
            <Route path="/invoice" element={<ProtectedRoute allowedRoles={['admin']}><Invoice /></ProtectedRoute>} />
            <Route path="/customer-history" element={<ProtectedRoute allowedRoles={['admin']}><CustomerHistory /></ProtectedRoute>} />
            <Route path="/revenue" element={<ProtectedRoute allowedRoles={['admin']}><RevenueDashboard /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
