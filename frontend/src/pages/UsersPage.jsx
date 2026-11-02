import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import axios from 'axios';

const roleColor = {
  ADMIN:   { bg: '#fdf0ef', color: '#e74c3c', border: '#f5c6c2' },
  OFFICER: { bg: '#fef9ef', color: '#f39c12', border: '#fde8a0' },
  CITIZEN: { bg: '#f0f7f0', color: '#4caf7d', border: '#c8e6c9' },
};

const UsersPage = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('ALL');
  const [search, setSearch]     = useState('');
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users
    .filter(u => filter === 'ALL' || u.role === filter)
    .filter(u =>
      search === '' ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );

  const stats = [
    { label: 'Total Users', value: users.length,                                    color: '#1a4731', bg: '#e8f5e9' },
    { label: 'Admins',      value: users.filter(u => u.role === 'ADMIN').length,    color: '#e74c3c', bg: '#fdf0ef' },
    { label: 'Officers',    value: users.filter(u => u.role === 'OFFICER').length,  color: '#f39c12', bg: '#fef9ef' },
    { label: 'Citizens',    value: users.filter(u => u.role === 'CITIZEN').length,  color: '#4caf7d', bg: '#f0f7f0' },
  ];

  return (
    <div style={s.layout}>
      <Sidebar />
      <div style={s.main}>

        {/* Header */}
        <div style={{
          ...s.header,
          opacity:   mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.6s ease',
        }}>
          <div>
            <h1 style={s.headerTitle}>👥 All Users</h1>
            <p style={s.headerSub}>Manage all registered users</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ ...s.statsGrid, opacity: mounted ? 1 : 0, transition: 'all 0.6s ease 0.1s' }}>
          {stats.map((stat, i) => (
            <div key={stat.label} style={{
              ...s.statCard, background: stat.bg,
              opacity:   mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.5s ease ${i * 0.1}s`,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,71,49,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ ...s.statNum, color: stat.color }}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div style={{ ...s.toolBar, opacity: mounted ? 1 : 0, transition: 'all 0.6s ease 0.2s' }}>
          <input
            style={s.searchInput}
            type="text"
            placeholder="🔍 Search by username or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => { e.target.style.border = '1.5px solid #4caf7d'; e.target.style.boxShadow = '0 0 0 3px rgba(76,175,125,0.15)'; }}
            onBlur={e  => { e.target.style.border = '1.5px solid #e0ede5'; e.target.style.boxShadow = 'none'; }}
          />
          <div style={s.filterRow}>
            {['ALL', 'ADMIN', 'OFFICER', 'CITIZEN'].map(f => (
              <button key={f} style={{
                ...s.filterBtn,
                background: filter === f ? '#1a4731' : '#fff',
                color:      filter === f ? '#fff'    : '#6b9e80',
                border:     filter === f ? '1.5px solid #1a4731' : '1.5px solid #e0ede5',
              }} onClick={() => setFilter(f)}>
                {f === 'ALL' ? '👥 All' :
                 f === 'ADMIN' ? '🛡️ Admin' :
                 f === 'OFFICER' ? '👮 Officer' : '👤 Citizen'}
              </button>
            ))}
          </div>
          <span style={s.countBadge}>{filtered.length} users</span>
        </div>

        {/* Users Table */}
        {loading ? (
          <div style={s.loadingBox}>
            <p style={{ color: '#6b9e80' }}>Loading users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyBox}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
            <p style={{ color: '#6b9e80' }}>No users found</p>
          </div>
        ) : (
          <div style={{ ...s.tableBox, opacity: mounted ? 1 : 0, transition: 'all 0.6s ease 0.3s' }}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>#ID</th>
                  <th style={s.th}>Username</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} style={{
                    ...s.tr,
                    opacity: mounted ? 1 : 0,
                    transition: `opacity 0.4s ease ${i * 0.05}s`,
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fbf9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={s.td}>
                      <span style={s.idBadge}>#{u.id}</span>
                    </td>
                    <td style={s.td}>
                      <div style={s.userCell}>
                        <div style={s.userAvatar}>
                          {u.username?.charAt(0).toUpperCase()}
                        </div>
                        <span style={s.username}>{u.username}</span>
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={s.email}>{u.email}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        ...s.roleBadge,
                        background: roleColor[u.role]?.bg,
                        color:      roleColor[u.role]?.color,
                        border:     `1px solid ${roleColor[u.role]?.border}`,
                      }}>
                        {u.role === 'ADMIN'   ? '🛡️' :
                         u.role === 'OFFICER' ? '👮' : '👤'} {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const s = {
  layout:      { display: 'flex', minHeight: '100vh', background: '#f0f7f0', fontFamily: "'Outfit', sans-serif" },
  main:        { marginLeft: '240px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 240px)' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerTitle: { fontSize: '24px', fontWeight: '700', color: '#1a2e1f', margin: 0 },
  headerSub:   { fontSize: '14px', color: '#6b9e80', marginTop: '4px' },
  statsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard:    { borderRadius: '14px', padding: '20px 24px', border: '1px solid #e0ede5', cursor: 'default', transition: 'all 0.2s ease' },
  statNum:     { fontSize: '32px', fontWeight: '700' },
  statLabel:   { fontSize: '13px', color: '#6b9e80', marginTop: '4px', fontWeight: '500' },
  toolBar:     { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  searchInput: { padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #e0ede5', fontSize: '14px', outline: 'none', background: '#fff', width: '280px', transition: 'all 0.2s', fontFamily: "'Outfit', sans-serif" },
  filterRow:   { display: 'flex', gap: '8px' },
  filterBtn:   { padding: '8px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  countBadge:  { marginLeft: 'auto', fontSize: '13px', color: '#6b9e80' },
  tableBox:    { background: '#fff', borderRadius: '16px', border: '1px solid #e0ede5', overflow: 'hidden', boxShadow: '0 4px 20px rgba(26,71,49,0.05)' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  thead:       { background: '#f8fbf9' },
  th:          { padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#1a4731', borderBottom: '1px solid #e0ede5', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr:          { borderBottom: '1px solid #f0f7f0', transition: 'background 0.15s ease' },
  td:          { padding: '14px 16px', fontSize: '14px', color: '#1a2e1f', verticalAlign: 'middle' },
  idBadge:     { background: '#f0f7f0', color: '#1a4731', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' },
  userCell:    { display: 'flex', alignItems: 'center', gap: '10px' },
  userAvatar:  { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf7d, #1a4731)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0 },
  username:    { fontWeight: '600', color: '#1a2e1f' },
  email:       { color: '#6b9e80', fontSize: '13px' },
  roleBadge:   { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' },
  loadingBox:  { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', background: '#fff', borderRadius: '16px', border: '1px solid #e0ede5' },
  emptyBox:    { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', background: '#fff', borderRadius: '16px', border: '1px solid #e0ede5' },
};

export default UsersPage;