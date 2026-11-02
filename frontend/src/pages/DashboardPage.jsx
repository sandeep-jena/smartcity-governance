import Sidebar from '../components/Sidebar.jsx';
import { useEffect, useState } from 'react';

const statusColor = { PENDING: '#e74c3c', IN_PROGRESS: '#f39c12', RESOLVED: '#4caf7d' };

const DashboardPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [MapComponents, setMapComponents] = useState(null);

  useEffect(() => {
    setComplaints([
      { id: 1, title: 'Broken Street Light',  description: 'Street light not working',  status: 'PENDING',     latitude: 20.2961, longitude: 85.8245 },
      { id: 2, title: 'Pothole on Main Road', description: 'Large pothole near market', status: 'IN_PROGRESS', latitude: 20.3000, longitude: 85.8200 },
      { id: 3, title: 'Water Leakage',        description: 'Pipe burst near school',    status: 'RESOLVED',    latitude: 20.2900, longitude: 85.8300 },
    ]);

    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
    ]).then(([reactLeaflet, L]) => {
      delete L.default.Icon.Default.prototype._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setMapComponents(reactLeaflet);
    });
  }, []);

  const stats = [
    { label: 'Total',       value: complaints.length,                                         color: '#1a4731', bg: '#e8f5e9' },
    { label: 'Pending',     value: complaints.filter(c => c.status === 'PENDING').length,      color: '#e74c3c', bg: '#fdf0ef' },
    { label: 'In Progress', value: complaints.filter(c => c.status === 'IN_PROGRESS').length,  color: '#f39c12', bg: '#fef9ef' },
    { label: 'Resolved',    value: complaints.filter(c => c.status === 'RESOLVED').length,     color: '#4caf7d', bg: '#f0f7f0' },
  ];

  const renderMap = () => {
    if (!MapComponents) return <div style={{ padding: '20px', color: '#6b9e80' }}>Loading map...</div>;
    const { MapContainer, TileLayer, Marker, Popup } = MapComponents;
    return (
      <MapContainer
        center={[20.2961, 85.8245]}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '14px' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {complaints.map((c) =>
          c.latitude && c.longitude ? (
            <Marker key={c.id} position={[c.latitude, c.longitude]}>
              <Popup>
                <strong>{c.title}</strong><br />
                {c.description}<br />
                <span style={{ color: statusColor[c.status], fontWeight: 600 }}>{c.status}</span>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    );
  };

  return (
    <div style={s.layout}>
      <Sidebar />
      <div style={s.main}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.headerTitle}>Welcome back 👋</h1>
            <p style={s.headerSub}>Here's what's happening in your city today</p>
          </div>
          <button style={s.newBtn} onClick={() => window.location.href = '/submit'}>
            ➕ New Complaint
          </button>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ ...s.statCard, background: stat.bg }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,71,49,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ ...s.statNum, color: stat.color }}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>🗺️ Complaint Map</h2>
          <div style={s.mapBox}>{renderMap()}</div>
        </div>

        {/* Table */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>📋 Recent Complaints</h2>
          <div style={s.tableBox}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>Title</th>
                  <th style={s.th}>Description</th>
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} style={s.tr}>
                    <td style={s.td}>{c.title}</td>
                    <td style={{ ...s.td, color: '#6b9e80' }}>{c.description}</td>
                    <td style={s.td}>
                      <span style={{
                        ...s.badge,
                        background: statusColor[c.status] + '22',
                        color: statusColor[c.status],
                      }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

const s = {
  layout:       { display: 'flex', minHeight: '100vh', background: '#f0f7f0', fontFamily: "'Outfit', sans-serif" },
  main:         { marginLeft: '240px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 240px)' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  headerTitle:  { fontSize: '24px', fontWeight: '700', color: '#1a2e1f' },
  headerSub:    { fontSize: '14px', color: '#6b9e80', marginTop: '4px' },
  newBtn:       { background: '#1a4731', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' },
  statCard:     { borderRadius: '14px', padding: '20px 24px', border: '1px solid #e0ede5', transition: 'all 0.2s ease', cursor: 'default' },
  statNum:      { fontSize: '32px', fontWeight: '700' },
  statLabel:    { fontSize: '13px', color: '#6b9e80', marginTop: '4px', fontWeight: '500' },
  section:      { marginBottom: '28px' },
  sectionTitle: { fontSize: '17px', fontWeight: '700', color: '#1a2e1f', marginBottom: '14px' },
  mapBox:       { height: '380px', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e0ede5' },
  tableBox:     { background: '#fff', borderRadius: '14px', border: '1px solid #e0ede5', overflow: 'hidden' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  thead:        { background: '#f8fbf9' },
  th:           { padding: '14px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#1a4731', borderBottom: '1px solid #e0ede5' },
  tr:           { borderBottom: '1px solid #f0f7f0' },
  td:           { padding: '14px 20px', fontSize: '14px', color: '#1a2e1f' },
  badge:        { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
};

export default DashboardPage;