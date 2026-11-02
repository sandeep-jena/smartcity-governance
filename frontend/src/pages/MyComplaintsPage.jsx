import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import axios from 'axios';

const statusColor = {
  PENDING:     { bg: '#fdf0ef', color: '#e74c3c', border: '#f5c6c2' },
  IN_PROGRESS: { bg: '#fef9ef', color: '#f39c12', border: '#fde8a0' },
  RESOLVED:    { bg: '#f0f7f0', color: '#4caf7d', border: '#c8e6c9' },
};

const statusIcon = {
  PENDING:     '🔴',
  IN_PROGRESS: '🟡',
  RESOLVED:    '🟢',
};

const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('ALL');
  const [selected, setSelected]     = useState(null);
  const [mounted, setMounted]       = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/citizen/my-complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch complaints', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'ALL'
    ? complaints
    : complaints.filter(c => c.status?.toUpperCase() === filter);

  const stats = [
    { label: 'Total',       value: complaints.length,                                        color: '#1a4731', bg: '#e8f5e9' },
    { label: 'Pending',     value: complaints.filter(c => c.status?.toUpperCase() === 'PENDING').length,     color: '#e74c3c', bg: '#fdf0ef' },
    { label: 'In Progress', value: complaints.filter(c => c.status?.toUpperCase() === 'IN_PROGRESS').length, color: '#f39c12', bg: '#fef9ef' },
    { label: 'Resolved',    value: complaints.filter(c => c.status?.toUpperCase() === 'RESOLVED').length,    color: '#4caf7d', bg: '#f0f7f0' },
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
            <h1 style={s.headerTitle}>My Complaints</h1>
            <p style={s.headerSub}>Track all your submitted complaints</p>
          </div>
          <button
            style={s.newBtn}
            onClick={() => navigate('/submit')}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(26,71,49,0.3)'; }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)';    e.target.style.boxShadow = 'none'; }}
          >
            ➕ New Complaint
          </button>
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

        {/* Filter Tabs */}
        <div style={{
          ...s.filterRow,
          opacity:   mounted ? 1 : 0,
          transition: 'all 0.6s ease 0.2s',
        }}>
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
              {f === 'ALL' ? '🗂 All' :
               f === 'PENDING' ? '🔴 Pending' :
               f === 'IN_PROGRESS' ? '🟡 In Progress' : '🟢 Resolved'}
            </button>
          ))}
          <span style={s.countBadge}>{filtered.length} complaint{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Complaints List */}
        {loading ? (
          <div style={s.loadingBox}>
            <div style={s.loadingSpinner}>⟳</div>
            <p style={{ color: '#6b9e80', marginTop: '12px' }}>Loading your complaints...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyBox}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ color: '#1a2e1f', marginBottom: '8px' }}>No complaints found</h3>
            <p style={{ color: '#6b9e80', marginBottom: '24px' }}>
              {filter === 'ALL' ? "You haven't submitted any complaints yet" : `No ${filter.toLowerCase()} complaints`}
            </p>
            <button style={s.newBtn} onClick={() => navigate('/submit')}>
              ➕ Submit Your First Complaint
            </button>
          </div>
        ) : (
          <div style={s.complaintsList}>
            {filtered.map((c, i) => (
              <div
                key={c.id}
                style={{
                  ...s.complaintCard,
                  opacity:   mounted ? 1 : 0,
                  transform: mounted ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `all 0.5s ease ${i * 0.08}s`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(26,71,49,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)';   e.currentTarget.style.boxShadow = 'none'; }}
                onClick={() => setSelected(selected?.id === c.id ? null : c)}
              >
                {/* Card Header */}
                <div style={s.cardTop}>
                  <div style={s.cardLeft}>
                    <div style={{
                      ...s.statusDot,
                      background: statusColor[c.status]?.bg || '#f0f7f0',
                      border: `1px solid ${statusColor[c.status]?.border || '#e0ede5'}`,
                    }}>
                      <span>{statusIcon[c.status] || '⚪'}</span>
                      <span style={{ color: statusColor[c.status]?.color, fontSize: '12px', fontWeight: '600' }}>
                        {c.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <span style={s.complaintId}>#{c.id}</span>
                  </div>
                  <span style={s.date}>
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>

                <h3 style={s.complaintTitle}>{c.title}</h3>
                <p style={s.complaintDesc}>{c.description}</p>

                {/* Officer */}
                {c.assignedOfficerName && (
                  <div style={s.officerBadge}>
                    👮 Assigned to: <strong>{c.assignedOfficerName}</strong>
                  </div>
                )}

                {/* Expanded Details */}
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
                        <span style={s.expandedLabel}>Location</span>
                        <span style={s.expandedValue}>
                          {c.latitude && c.longitude
                            ? `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}`
                            : 'Not specified'}
                        </span>
                      </div>
                      <div style={s.expandedItem}>
                        <span style={s.expandedLabel}>Officer</span>
                        <span style={s.expandedValue}>
                          {c.assignedOfficerName || 'Not assigned yet'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div style={s.cardFooter}>
                  <span style={s.clickHint}>
                    {selected?.id === c.id ? '▲ Less details' : '▼ More details'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const s = {
  layout:         { display: 'flex', minHeight: '100vh', background: '#f0f7f0', fontFamily: "'Outfit', sans-serif" },
  main:           { marginLeft: '240px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 240px)' },
  header:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerTitle:    { fontSize: '24px', fontWeight: '700', color: '#1a2e1f', margin: 0 },
  headerSub:      { fontSize: '14px', color: '#6b9e80', marginTop: '4px' },
  newBtn:         { padding: '12px 20px', background: '#1a4731', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  statsGrid:      { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard:       { borderRadius: '14px', padding: '20px 24px', border: '1px solid #e0ede5', cursor: 'default', transition: 'all 0.2s ease' },
  statNum:        { fontSize: '32px', fontWeight: '700' },
  statLabel:      { fontSize: '13px', color: '#6b9e80', marginTop: '4px', fontWeight: '500' },
  filterRow:      { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  filterBtn:      { padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  countBadge:     { marginLeft: 'auto', fontSize: '13px', color: '#6b9e80', fontWeight: '500' },
  complaintsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  complaintCard:  { background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #e0ede5', cursor: 'pointer', transition: 'all 0.2s ease' },
  cardTop:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  cardLeft:       { display: 'flex', alignItems: 'center', gap: '10px' },
  statusDot:      { display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' },
  complaintId:    { fontSize: '12px', color: '#6b9e80', fontWeight: '500' },
  date:           { fontSize: '12px', color: '#6b9e80' },
  complaintTitle: { fontSize: '16px', fontWeight: '700', color: '#1a2e1f', margin: '0 0 6px' },
  complaintDesc:  { fontSize: '14px', color: '#6b9e80', lineHeight: '1.6', margin: '0 0 12px' },
  officerBadge:   { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(76,175,125,0.1)', border: '1px solid rgba(76,175,125,0.2)', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', color: '#1a4731', marginBottom: '12px' },
  expandedBox:    { background: '#f8fbf9', borderRadius: '10px', padding: '16px', marginTop: '12px', border: '1px solid #e0ede5' },
  expandedGrid:   { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  expandedItem:   { display: 'flex', flexDirection: 'column', gap: '4px' },
  expandedLabel:  { fontSize: '11px', color: '#6b9e80', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' },
  expandedValue:  { fontSize: '14px', color: '#1a2e1f', fontWeight: '500' },
  cardFooter:     { marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f7f0' },
  clickHint:      { fontSize: '12px', color: '#6b9e80' },
  loadingBox:     { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', background: '#fff', borderRadius: '16px', border: '1px solid #e0ede5' },
  loadingSpinner: { fontSize: '40px', animation: 'spin 1s linear infinite' },
  emptyBox:       { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', background: '#fff', borderRadius: '16px', border: '1px solid #e0ede5', textAlign: 'center' },
};

export default MyComplaintsPage;
