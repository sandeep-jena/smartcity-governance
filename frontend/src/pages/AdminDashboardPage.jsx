import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import axios from 'axios';

const statusColor = {
  PENDING:     { bg: '#fdf0ef', color: '#e74c3c', border: '#f5c6c2' },
  IN_PROGRESS: { bg: '#fef9ef', color: '#f39c12', border: '#fde8a0' },
  RESOLVED:    { bg: '#f0f7f0', color: '#4caf7d', border: '#c8e6c9' },
};

const AdminDashboardPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('ALL');
  const [search, setSearch]         = useState('');
  const [mounted, setMounted]       = useState(false);
  const [assigning, setAssigning]   = useState(null);
  const [toast, setToast]           = useState(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [cRes, oRes] = await Promise.all([
        axios.get('http://localhost:8080/api/admin/complaints', { headers }),
        axios.get('http://localhost:8080/api/admin/officers',   { headers }),
      ]);
      setComplaints(cRes.data);
      setOfficers(oRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (complaintId, officerUsername) => {
    setAssigning(complaintId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/admin/assign-officer/${complaintId}?officerUsername=${officerUsername}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('✅ Officer assigned successfully!');
      fetchData();
    } catch (err) {
      showToast('❌ Failed to assign officer');
    } finally {
      setAssigning(null);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = complaints
    .filter(c => filter === 'ALL' || c.status?.toUpperCase() === filter)
    .filter(c =>
      search === '' ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.citizenName?.toLowerCase().includes(search.toLowerCase())
    );

  const stats = [
    { label: 'Total',       value: complaints.length,                                        color: '#1a4731', bg: '#e8f5e9' },
    { label: 'Pending',     value: complaints.filter(c => c.status?.toUpperCase() === 'PENDING').length,     color: '#e74c3c', bg: '#fdf0ef' },
    { label: 'In Progress', value: complaints.filter(c => c.status?.toUpperCase() === 'IN_PROGRESS').length, color: '#f39c12', bg: '#fef9ef' },
    { label: 'Resolved',    value: complaints.filter(c => c.status?.toUpperCase() === 'RESOLVED').length,    color: '#4caf7d', bg: '#f0f7f0' },
  ];

  return (
    <div style={s.layout}>
      <Sidebar />

      {/* Toast */}
      {toast && (
        <div style={s.toast}>{toast}</div>
      )}

      <div style={s.main}>

        {/* Header */}
        <div style={{
          ...s.header,
          opacity:   mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.6s ease',
        }}>
          <div>
            <h1 style={s.headerTitle}>Admin Dashboard</h1>
            <p style={s.headerSub}>Manage all complaints and assign officers</p>
          </div>
          <div style={s.headerRight}>
            <div style={s.officerCount}>
              👮 {officers.length} Officers available
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          ...s.statsGrid,
          opacity:   mounted ? 1 : 0,
          transition: 'all 0.6s ease 0.1s',
        }}>
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                ...s.statCard,
                background: stat.bg,
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
        <div style={{
          ...s.toolBar,
          opacity:   mounted ? 1 : 0,
          transition: 'all 0.6s ease 0.2s',
        }}>
          <input
            style={s.searchInput}
            type="text"
            placeholder="🔍 Search by title or citizen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => { e.target.style.border = '1.5px solid #4caf7d'; e.target.style.boxShadow = '0 0 0 3px rgba(76,175,125,0.15)'; }}
            onBlur={e  => { e.target.style.border = '1.5px solid #e0ede5'; e.target.style.boxShadow = 'none'; }}
          />
          <div style={s.filterRow}>
            {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map(f => (
              <button
                key={f}
                style={{
                  ...s.filterBtn,
                  background: filter === f ? '#1a4731' : '#fff',
                  color:      filter === f ? '#fff'    : '#6b9e80',
                  border:     filter === f ? '1.5px solid #1a4731' : '1.5px solid #e0ede5',
                }}
                onClick={() => setFilter(f)}
              >
                {f === 'ALL' ? 'All' :
                 f === 'PENDING' ? '🔴 Pending' :
                 f === 'IN_PROGRESS' ? '🟡 In Progress' : '🟢 Resolved'}
              </button>
            ))}
          </div>
          <span style={s.countBadge}>{filtered.length} complaints</span>
        </div>

        {/* Complaints Table */}
        {loading ? (
          <div style={s.loadingBox}>
            <p style={{ color: '#6b9e80' }}>Loading complaints...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyBox}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <p style={{ color: '#6b9e80' }}>No complaints found</p>
          </div>
        ) : (
          <div style={{
            ...s.tableBox,
            opacity:   mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease 0.3s',
          }}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>#ID</th>
                  <th style={s.th}>Title</th>
                  <th style={s.th}>Citizen</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Assigned Officer</th>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Photo</th>
                  <th style={s.th}>Assign Officer</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      ...s.tr,
                      opacity:   mounted ? 1 : 0,
                      transition: `opacity 0.4s ease ${i * 0.05}s`,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fbf9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={s.td}>
                      <span style={s.idBadge}>#{c.id}</span>
                    </td>
                    <td style={s.td}>
                      <div style={s.titleCell}>{c.title}</div>
                      <div style={s.descCell}>{c.description?.substring(0, 50)}...</div>
                    </td>
                    <td style={s.td}>
                      <div style={s.citizenCell}>
                        <div style={s.citizenAvatar}>
                          {c.citizenName?.charAt(0).toUpperCase()}
                        </div>
                        {c.citizenName}
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        ...s.statusBadge,
                        background: statusColor[c.status]?.bg,
                        color:      statusColor[c.status]?.color,
                        border:     `1px solid ${statusColor[c.status]?.border}`,
                      }}>
                        {c.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={s.td}>
                      {c.assignedOfficerName ? (
                        <div style={s.officerBadge}>
                          👮 {c.assignedOfficerName}
                        </div>
                      ) : (
                        <span style={{ color: '#6b9e80', fontSize: '13px' }}>Not assigned</span>
                      )}
                    </td>
                    <td style={s.td}>
                      <span style={{ fontSize: '13px', color: '#6b9e80' }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </td>
                    
                    <td style={s.td}>
  {c.imagePath ? (
    <img
      src={`http://localhost:8080/${c.imagePath}`}
      alt="Complaint"
      style={{
        width: '60px',
        height: '44px',
        objectFit: 'cover',
        borderRadius: '6px',
        cursor: 'pointer',
        border: '1px solid #e0ede5',
      }}
      onClick={() =>
        window.open(`http://localhost:8080/${c.imagePath}`, '_blank')
      }
    />
  ) : (
    <span style={{ color: '#bbb', fontSize: '12px' }}>
      No Image
    </span>
  )}
</td>
                    <td style={s.td}>
  {c.status?.toUpperCase() === 'RESOLVED' ? (
    <span style={{
      padding: '6px 12px',
      background: 'rgba(76,175,125,0.1)',
      border: '1px solid rgba(76,175,125,0.2)',
      borderRadius: '8px',
      fontSize: '12px',
      color: '#4caf7d',
      fontWeight: '600',
    }}>
      ✅ Resolved
    </span>
  ) : (
    <select
      style={s.assignSelect}
      defaultValue=""
      onChange={e => {
        if (e.target.value) handleAssign(c.id, e.target.value);
      }}
      disabled={assigning === c.id}
    >
      <option value="" disabled>
        {assigning === c.id ? 'Assigning...' : 'Select officer'}
      </option>
      {officers.map(o => (
        <option key={o.id} value={o.username}>
          {o.username}
        </option>
      ))}
    </select>
  )}
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const s = {
  layout:       { display: 'flex', minHeight: '100vh', background: '#f0f7f0', fontFamily: "'Outfit', sans-serif" },
  main:         { marginLeft: '240px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 240px)' },
  toast:        { position: 'fixed', top: '24px', right: '24px', background: '#1a4731', color: '#fff', padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', zIndex: 999, animation: 'slideIn 0.3s ease', boxShadow: '0 8px 24px rgba(26,71,49,0.3)' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerTitle:  { fontSize: '24px', fontWeight: '700', color: '#1a2e1f', margin: 0 },
  headerSub:    { fontSize: '14px', color: '#6b9e80', marginTop: '4px' },
  headerRight:  { display: 'flex', gap: '12px', alignItems: 'center' },
  officerCount: { padding: '10px 16px', background: 'rgba(76,175,125,0.1)', border: '1px solid rgba(76,175,125,0.2)', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#1a4731' },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard:     { borderRadius: '14px', padding: '20px 24px', border: '1px solid #e0ede5', cursor: 'default', transition: 'all 0.2s ease' },
  statNum:      { fontSize: '32px', fontWeight: '700' },
  statLabel:    { fontSize: '13px', color: '#6b9e80', marginTop: '4px', fontWeight: '500' },
  toolBar:      { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  searchInput:  { padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #e0ede5', fontSize: '14px', outline: 'none', background: '#fff', width: '280px', transition: 'all 0.2s', fontFamily: "'Outfit', sans-serif" },
  filterRow:    { display: 'flex', gap: '8px' },
  filterBtn:    { padding: '8px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  countBadge:   { marginLeft: 'auto', fontSize: '13px', color: '#6b9e80' },
  tableBox:     { background: '#fff', borderRadius: '16px', border: '1px solid #e0ede5', overflow: 'hidden', boxShadow: '0 4px 20px rgba(26,71,49,0.05)' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  thead:        { background: '#f8fbf9' },
  th:           { padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#1a4731', borderBottom: '1px solid #e0ede5', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr:           { borderBottom: '1px solid #f0f7f0', transition: 'background 0.15s ease' },
  td:           { padding: '14px 16px', fontSize: '14px', color: '#1a2e1f', verticalAlign: 'middle' },
  idBadge:      { background: '#f0f7f0', color: '#1a4731', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' },
  titleCell:    { fontWeight: '600', color: '#1a2e1f', marginBottom: '3px' },
  descCell:     { fontSize: '12px', color: '#6b9e80' },
  citizenCell:  { display: 'flex', alignItems: 'center', gap: '8px' },
  citizenAvatar:{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf7d, #1a4731)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff', flexShrink: 0 },
  statusBadge:  { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' },
  officerBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(76,175,125,0.1)', border: '1px solid rgba(76,175,125,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', color: '#1a4731', fontWeight: '600' },
  assignSelect: { padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e0ede5', fontSize: '13px', color: '#1a2e1f', outline: 'none', background: '#f8fbf9', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", width: '160px' },
  loadingBox:   { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', background: '#fff', borderRadius: '16px', border: '1px solid #e0ede5' },
  emptyBox:     { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', background: '#fff', borderRadius: '16px', border: '1px solid #e0ede5' },
};

export default AdminDashboardPage;