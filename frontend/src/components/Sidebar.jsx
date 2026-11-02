import { useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell.jsx';

const Sidebar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const role      = localStorage.getItem('role');
  const username  = localStorage.getItem('username') || 'Citizen';

  const menuItems = role === 'ADMIN' ? [
  { icon: '🏠', label: 'Dashboard',      path: '/admin'      },
  { icon: '🗺️', label: 'Map View',       path: '/map'        },
  { icon: '👥', label: 'All Users',      path: '/admin'      },
] : role === 'OFFICER' ? [
  { icon: '🏠', label: 'Dashboard',      path: '/officer'    },
  { icon: '🗺️', label: 'Map View',       path: '/map'        },
] : [
  { icon: '🏠', label: 'Dashboard',      path: '/dashboard'  },
  { icon: '📝', label: 'My Complaints',  path: '/complaints' },
  { icon: '➕', label: 'New Complaint',  path: '/submit'     },
  { icon: '🗺️', label: 'Map View',       path: '/map'        },
];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={s.sidebar} className="anim-fadeInLeft">

      {/* Brand */}
      <div style={s.brand} className="anim-fadeInUp delay-1">
        <div style={s.brandIcon}>🏙️</div>
        <div>
          <div style={s.brandName}>SmartCity</div>
          <div style={s.brandSub}>Governance</div>
        </div>
      </div>

      {/* User Info */}
      <div style={s.userBox} className="anim-fadeInUp delay-2">
        <div style={s.avatar} className="anim-glow">
          {username.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={s.userName}>{username}</div>
          <div style={s.userRole}>{role || 'Citizen'}</div>
        </div>
      </div>

      {/* Menu */}
      <nav style={s.nav}>
        {menuItems.map((item, i) => {
          const active = location.pathname === item.path;
          return (
            <div
              key={item.label}
              style={active ? s.menuItemActive : s.menuItem}
              className={`anim-fadeInLeft delay-${i + 2}`}
              onClick={() => navigate(item.path)}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(76,175,125,0.12)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <span style={s.menuIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={s.divider} />

      <div style={{ padding: '12px 20px' }}>
      <NotificationBell />
      </div>

      {/* Logout */}
      <div style={s.logoutBox} className="anim-fadeInUp delay-5">
        <div
          style={s.logoutBtn}
          onClick={handleLogout}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(231,76,60,0.15)';
            e.currentTarget.style.color = '#e74c3c';
            e.currentTarget.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <span style={s.menuIcon}>🚪</span>
          <span>Logout</span>
        </div>
      </div>

    </div>
  );
};

const s = {
  sidebar: {
    width: '240px', minHeight: '100vh',
    background: '#1a4731', display: 'flex',
    flexDirection: 'column', position: 'fixed',
    top: 0, left: 0, zIndex: 100,
    boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
  },
  brand:          { display: 'flex', alignItems: 'center', gap: '12px', padding: '28px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  brandIcon:      { fontSize: '28px' },
  brandName:      { fontSize: '16px', fontWeight: '700', color: '#fff' },
  brandSub:       { fontSize: '11px', color: '#4caf7d', letterSpacing: '2px', textTransform: 'uppercase' },
  userBox:        { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '8px' },
  avatar:         { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf7d, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#fff', boxShadow: '0 2px 8px rgba(76,175,125,0.4)' },
  userName:       { fontSize: '14px', fontWeight: '600', color: '#fff' },
  userRole:       { fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' },
  nav:            { flex: 1, padding: '8px 12px' },
  menuItem:       { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', fontSize: '14px', fontWeight: '500', marginBottom: '4px', transition: 'all 0.2s ease' },
  menuItemActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', color: '#fff', fontSize: '14px', fontWeight: '600', background: 'rgba(76,175,125,0.2)', borderLeft: '3px solid #4caf7d', marginBottom: '4px', transition: 'all 0.2s ease', boxShadow: '0 2px 12px rgba(76,175,125,0.15)' },
  menuIcon:       { fontSize: '18px', width: '24px', textAlign: 'center' },
  divider:        { height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 12px' },
  logoutBox:      { padding: '12px' },
  logoutBtn:      { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s ease' },
};

export default Sidebar;