import { NavLink } from 'react-router-dom';
import { Home, List, BookOpen, Settings as SettingsIcon, ClipboardList, Heart, Calculator, Calendar, Users, FileText, Package, BarChart2, MessageCircle, Bell } from 'lucide-react';
import useStore from '../store/useStore';

const Navigation = () => {
  const favorites = useStore(state => state.favorites);
  return (
    <nav className="nav-bar">
      <NavLink 
        to="/" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <Home size={24} />
        <span>หน้าแรก</span>
      </NavLink>
      <NavLink 
        to="/calculators" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <Calculator size={24} />
        <span>คำนวณ</span>
      </NavLink>
      <NavLink 
        to="/learning" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <BookOpen size={24} />
        <span>ความรู้</span>
      </NavLink>

      <NavLink to="/schedule" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Calendar size={24} />
        <span>ตารางงาน</span>
      </NavLink>

      <NavLink to="/work-log" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <ClipboardList size={24} />
        <span>จดงาน</span>
      </NavLink>

      <NavLink to="/customer-history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Users size={24} />
        <span>ประวัติลูกค้า</span>
      </NavLink>

      <NavLink to="/quotation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <FileText size={24} />
        <span>ใบเสนอราคา</span>
      </NavLink>

      <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Package size={24} />
        <span>คลังอะไหล่</span>
      </NavLink>

      <NavLink to="/revenue" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <BarChart2 size={24} />
        <span>รายได้</span>
      </NavLink>

      <NavLink to="/team-chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <MessageCircle size={24} />
        <span>แชททีม</span>
      </NavLink>

      <NavLink to="/reminders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Bell size={24} />
        <span>แจ้งเตือน</span>
      </NavLink>

      <NavLink to="/favorites" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ position: 'relative' }}>
        <Heart size={24} color={favorites.length > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)'} fill={favorites.length > 0 ? 'var(--accent-primary)' : 'none'} />
        <span>โปรด ({favorites.length})</span>
      </NavLink>
      
      <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <SettingsIcon size={24} />
        <span>ตั้งค่า</span>
      </NavLink>
    </nav>
  );
};

export default Navigation;
