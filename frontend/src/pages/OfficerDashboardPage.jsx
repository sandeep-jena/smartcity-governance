import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import axios from 'axios';

const statusColor = {
  PENDING:     { bg: '#fdf0ef', color: '#e74c3c', border: '#f5c6c2' },
  IN_PROGRESS: { bg: '#fef9ef', color: '#f39c12', border: '#fde8a0' },
  RESOLVED:    { bg: '#f0f7f0', color: '#4caf7d', border: '#c8e6c9' },
};

const OfficerDashboardPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('ALL');
  const [mounted, setMounted]       = useState(false);
  const [updating, setUpdating]     = useState(null);
  const [selected, setSelected]     = useState(null);
  const [toast, setToast]           = useState(null);
  const username = localStorage.getItem('username') || 'Officer';

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/officer/complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch complaints', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, status) => {
    setUpdating(complaintId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/officer/complaints/${complaintId}/status?status=${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(status === 'RESOLVED' ? '✅ Complaint resolved!' : '🔄 Status updated!');
      fetchComplaints();
    } catch (err) {
      showToast('❌ Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = filter === 'ALL'
  ? complaints
  : complaints.filter(c => c.status?.toUpperCase() === filter);

  const stats = [
    { label: 'Assigned',    value: complaints.length,                                        color: '#1a4731', bg: '#e8f5e9' },
     { label: 'Pending',     value: complaints.filter(c => c.status?.toUpperCase() === 'PENDING').length,     color: '#e74c3c', bg: '#fdf0ef' },
     { label: 'In Progress', value: complaints.filter(c => c.status?.toUpperCase() === 'IN_PROGRESS').length, color: '#f39c12', bg: '#fef9ef' },
     { label: 'Resolved',    value: complaints.filter(c => c.status?.toUpperCase() === 'RESOLVED').length,    color: '#4caf7d', bg: '#f0f7f0' }, 
  ];

  return (
    <div style={s.layout}>
      <Sidebar />
      {toast && <div style={s.toast}>{toast}</div>}

      <div style={s.main}>
        {/* Header */}
        <div style={{
          ...s.header,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.6s ease',
        }}>
          <div>
            <h1 style={s.headerTitle}>Officer Dashboard 👮</h1>
            <p style={s.headerSub}>Manage and resolve your assigned complaints</p>
          </div>
          <div style={s.officerTag}>
            <div style={s.officerAvatar}>{username.charAt(0).toUpperCase()}</div>
            <div>
              <div style={s.officerName}>{username}</div>
              <div style={s.officerRole}>Field Officer</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ ...s.statsGrid, opacity: mounted ? 1 : 0, transition: 'all 0.6s ease 0.1s' }}>
          {stats.map((stat, i) => (
            <div key={stat.label} style={{
              ...s.statCard, background: stat.bg,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.5s ease ${i * 0.1}s`,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,71,49,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ ...s.statNum, color: stat.color }}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ ...s.filterRow, opacity: mounted ? 1 : 0, transition: 'all 0.6s ease 0.2s' }}>
          {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map(f => (
            <button key={f} style={{
              ...s.filterBtn,
              background: filter === f ? '#1a4731' : '#fff',
              color:      filter === f ? '#fff'    : '#6b9e80',
              border:     filter === f ? '1.5px solid #1a4731' : '1.5px solid #e0ede5',
            }} onClick={() => setFilter(f)}>
              {f === 'ALL' ? '🗂 All' :
               f === 'PENDING' ? '🔴 Pending' :
               f === 'IN_PROGRESS' ? '🟡 In Progress' : '🟢 Resolved'}
            </button>
          ))}
          <span style={s.countBadge}>{filtered.length} complaints</span>
        </div>

        {/* Complaints */}
        {loading ? (
          <div style={s.loadingBox}>
            <p style={{ color: '#6b9e80' }}>Loading your complaints...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyBox}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ color: '#1a2e1f', marginBottom: '8px' }}>
              {filter === 'ALL' ? 'No complaints assigned yet' : `No ${filter} complaints`}
            </h3>
            <p style={{ color: '#6b9e80' }}>Check back later for new assignments</p>
          </div>
        ) : (
          <div style={s.complaintsList}>
            {filtered.map((c, i) => (
              <div key={c.id} style={{
                ...s.complaintCard,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-20px)',
                transition: `all 0.5s ease ${i * 0.08}s`,
                border: selected?.id === c.id ? '1.5px solid #4caf7d' : '1px solid #e0ede5',
              }}>
                <div style={s.cardTop}>
                  <div style={s.cardLeft}>
                    <span style={{
                      ...s.statusBadge,
                      background: statusColor[c.status]?.bg,
                      color:      statusColor[c.status]?.color,
                      border:     `1px solid ${statusColor[c.status]?.border}`,
                    }}>
                      {c.status === 'PENDING' ? '🔴' : c.status === 'IN_PROGRESS' ? '🟡' : '🟢'} {c.status?.replace('_', ' ')}
                    </span>
                    <span style={s.idBadge}>#{c.id}</span>
                  </div>
                  <span style={s.date}>
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>

                <h3 style={s.complaintTitle}>{c.title}</h3>
                <p style={s.complaintDesc}>{c.description}</p>

                <div style={s.citizenRow}>
                  <div style={s.citizenAvatar2}>{c.citizenName?.charAt(0).toUpperCase()}</div>
                  <span style={s.citizenName}>Reported by {c.citizenName}</span>
                  {c.latitude && c.longitude && (
                    <span style={s.locationBadge}>
                      📍 {c.latitude?.toFixed(3)}, {c.longitude?.toFixed(3)}
                    </span>
                  )}
                </div>

                {/* 📷 Complaint Image */}
<div style={{ marginTop: '10px' }}>
  {c.imagePath ? (
    <div style={s.expandedItem}>
      <span style={s.expandedLabel}>Attached Photo</span>
      <img
        src={`http://localhost:8080/${c.imagePath}`}
        alt="Complaint"
        style={{
          width: '100%',
          maxHeight: '180px',
          objectFit: 'cover',
          borderRadius: '8px',
          marginTop: '6px',
          cursor: 'pointer',
          border: '1px solid #e0ede5',
        }}
        onClick={() =>
          window.open(`http://localhost:8080/${c.imagePath}`, '_blank')
        }
      />
    </div>
  ) : (
    <span style={{ fontSize: '12px', color: '#bbb' }}>
      No Image Attached
    </span>
  )}
</div>

                {c.status !== 'RESOLVED' && (
                  <div style={s.actionRow}>
                    {c.status === 'PENDING' && (
                      <button style={s.inProgressBtn} disabled={updating === c.id}
                        onClick={() => handleStatusUpdate(c.id, 'IN_PROGRESS')}
                        onMouseEnter={e => { e.target.style.background = '#e67e00'; }}
                        onMouseLeave={e => { e.target.style.background = '#f39c12'; }}>
                        {updating === c.id ? 'Updating...' : '🔄 Mark In Progress'}
                      </button>
                    )}
                    {c.status === 'IN_PROGRESS' && (
                      <button style={s.resolveBtn} disabled={updating === c.id}
                        onClick={() => handleStatusUpdate(c.id, 'RESOLVED')}
                        onMouseEnter={e => { e.target.style.background = '#2d8a5e'; }}
                        onMouseLeave={e => { e.target.style.background = '#4caf7d'; }}>
                        {updating === c.id ? 'Resolving...' : '✅ Mark Resolved'}
                      </button>
                    )}
                    <button style={s.detailsBtn}
                      onClick={() => setSelected(selected?.id === c.id ? null : c)}>
                      {selected?.id === c.id ? '▲ Hide Details' : '▼ View Details'}
                    </button>
                  </div>
                )}

                {c.status === 'RESOLVED' && (
                  <div style={s.resolvedBadge}>✅ This complaint has been resolved</div>
                )}

                {selected?.id === c.id && (
                  <div style={s.expandedBox}>
                    <div style={s.expandedGrid}>
                      <div style={s.expandedItem}>
                        <span style={s.expandedLabel}>Complaint ID</span>
                        <span style={s.expandedValue}>#{c.id}</span>
                      </div>
                      <div style={s.expandedItem}>
                        <span style={s.expandedLabel}>Status</span>
                        <span style={{ ...s.expandedValue, color: statusColor[c.status]?.color }}>
                          {c.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <div style={s.expandedItem}>
                        <span style={s.expandedLabel}>Citizen</span>
                        <span style={s.expandedValue}>{c.citizenName}</span>
                      </div>
                      <div style={s.expandedItem}>
                        <span style={s.expandedLabel}>Location</span>
                        <span style={s.expandedValue}>
                          {c.latitude && c.longitude
                            ? `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}`
                            : 'Not specified'}
                        </span>
                      </div>
                      <div style={s.expandedItem}>
                        <span style={s.expandedLabel}>Submitted</span>
                        <span style={s.expandedValue}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleString('en-IN') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
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
  layout:        { display: 'flex', minHeight: '100vh', background: '#f0f7f0', fontFamily: "'Outfit', sans-serif" },
  main:          { marginLeft: '240px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 240px)' },
  toast:         { position: 'fixed', top: '24px', right: '24px', background: '#1a4731', color: '#fff', padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', zIndex: 999, animation: 'slideIn 0.3s ease', boxShadow: '0 8px 24px rgba(26,71,49,0.3)' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerTitle:   { fontSize: '24px', fontWeight: '700', color: '#1a2e1f', margin: 0 },
  headerSub:     { fontSize: '14px', color: '#6b9e80', marginTop: '4px' },
  officerTag:    { display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e0ede5' },
  officerAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf7d, #1a4731)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#fff' },
  officerName:   { fontSize: '14px', fontWeight: '700', color: '#1a2e1f' },
  officerRole:   { fontSize: '11px', color: '#4caf7d', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' },
  statsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard:      { borderRadius: '14px', padding: '20px 24px', border: '1px solid #e0ede5', cursor: 'default', transition: 'all 0.2s ease' },
  statNum:       { fontSize: '32px', fontWeight: '700' },
  statLabel:     { fontSize: '13px', color: '#6b9e80', marginTop: '4px', fontWeight: '500' },
  filterRow:     { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  filterBtn:     { padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  countBadge:    { marginLeft: 'auto', fontSize: '13px', color: '#6b9e80' },
  complaintsList:{ display: 'flex', flexDirection: 'column', gap: '12px' },
  complaintCard: { background: '#fff', borderRadius: '16px', padding: '22px 24px', cursor: 'default', transition: 'all 0.2s ease' },
  cardTop:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  cardLeft:      { display: 'flex', alignItems: 'center', gap: '10px' },
  statusBadge:   { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  idBadge:       { background: '#f0f7f0', color: '#1a4731', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' },
  date:          { fontSize: '12px', color: '#6b9e80' },
  complaintTitle:{ fontSize: '17px', fontWeight: '700', color: '#1a2e1f', margin: '0 0 6px' },
  complaintDesc: { fontSize: '14px', color: '#6b9e80', lineHeight: '1.6', margin: '0 0 14px' },
  citizenRow:    { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  citizenAvatar2:{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf7d, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff' },
  citizenName:   { fontSize: '13px', color: '#1a4731', fontWeight: '600' },
  locationBadge: { marginLeft: 'auto', fontSize: '12px', color: '#6b9e80', background: '#f8fbf9', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e0ede5' },
  actionRow:     { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  inProgressBtn: { padding: '10px 18px', background: '#f39c12', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' },
  resolveBtn:    { padding: '10px 18px', background: '#4caf7d', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' },
  detailsBtn:    { padding: '10px 18px', background: 'transparent', color: '#1a4731', border: '1.5px solid #e0ede5', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  resolvedBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(76,175,125,0.1)', border: '1px solid rgba(76,175,125,0.2)', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#1a4731', fontWeight: '600', marginTop: '8px' },
  expandedBox:   { background: '#f8fbf9', borderRadius: '10px', padding: '16px', marginTop: '16px', border: '1px solid #e0ede5' },
  expandedGrid:  { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  expandedItem:  { display: 'flex', flexDirection: 'column', gap: '4px' },
  expandedLabel: { fontSize: '11px', color: '#6b9e80', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' },
  expandedValue: { fontSize: '14px', color: '#1a2e1f', fontWeight: '500' },
  loadingBox:    { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', background: '#fff', borderRadius: '16px', border: '1px solid #e0ede5' },
  emptyBox:      { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', background: '#fff', borderRadius: '16px', border: '1px solid #e0ede5', textAlign: 'center' },
};

export default OfficerDashboardPage;