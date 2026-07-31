import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Settings as SettingsIcon, ClipboardList, Heart, Calculator, Calendar, Users, FileText, Package, BarChart2, MessageCircle, Bell, LogOut, CreditCard } from 'lucide-react';
import useStore from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'หน้าแรก', end: true },
  { to: '/calculators', icon: Calculator, label: 'คำนวณ' },
  { to: '/learning', icon: BookOpen, label: 'ความรู้' },
  { to: '/schedule', icon: Calendar, label: 'ตารางงาน' },
  { to: '/work-log', icon: ClipboardList, label: 'จดงาน' },
  { to: '/inventory', icon: Package, label: 'คลังอะไหล่' },
];

const ADMIN_ITEMS = [
  { to: '/quotation', icon: FileText, label: 'ใบเสนอราคา' },
  { to: '/invoice', icon: CreditCard, label: 'เอกสารการเงิน' },
  { to: '/customer-history', icon: Users, label: 'ประวัติลูกค้า' },
  { to: '/revenue', icon: BarChart2, label: 'รายได้' },
];

const BOTTOM_ITEMS = [
  { to: '/team-chat', icon: MessageCircle, label: 'แชททีม' },
  { to: '/notifications', icon: Bell, label: 'แจ้งเตือน' },
  { to: '/favorites', icon: Heart, label: 'โปรด' },
  { to: '/settings', icon: SettingsIcon, label: 'ตั้งค่า' },
];

const ALL_ITEMS = [...NAV_ITEMS, ...ADMIN_ITEMS, ...BOTTOM_ITEMS];

const Navigation = () => {
  const location = useLocation();
  const favorites = useStore(state => state.favorites);
  const notifications = useStore(state => state.notifications) || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const { userRole, logout } = useAuth();

  // Find current page label for the active indicator tooltip
  const currentItem = ALL_ITEMS.find(item => {
    if (item.end) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  });
  const currentLabel = currentItem ? currentItem.label : '';
  const CurrentIcon = currentItem ? currentItem.icon : null;

  return (
    <nav className="nav-bar">
      {/* Active page indicator shown at top when collapsed */}
      {currentLabel && (
        <div className="nav-active-badge" title={currentLabel}>
          {CurrentIcon && <CurrentIcon size={20} />}
          <span className="nav-active-badge-text">{currentLabel}</span>
        </div>
      )}

      {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}

      {userRole === 'admin' && ADMIN_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}

      <NavLink to="/team-chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <MessageCircle size={22} />
        <span>แชททีม</span>
      </NavLink>

      <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <Bell size={22} />
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <span>แจ้งเตือน</span>
      </NavLink>

      <NavLink to="/favorites" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Heart size={22} color={favorites.length > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)'} fill={favorites.length > 0 ? 'var(--accent-primary)' : 'none'} />
        <span>โปรด ({favorites.length})</span>
      </NavLink>

      <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <SettingsIcon size={22} />
        <span>ตั้งค่า</span>
      </NavLink>

      <button onClick={logout} className="nav-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
        <LogOut size={22} />
        <span>ออกจากระบบ</span>
      </button>
    </nav>
  );
};

export default Navigation;
