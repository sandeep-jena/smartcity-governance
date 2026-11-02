import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import axios from 'axios';

const statusColor = {
  PENDING:     '#e74c3c',
  IN_PROGRESS: '#f39c12',
  RESOLVED:    '#4caf7d',
};

const MapViewPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter]         = useState('ALL');
  const [loading, setLoading]       = useState(true);
  const [mounted, setMounted]       = useState(false);
  const [selected, setSelected]     = useState(null);
  const mapRef                      = useRef(null);
  const mapInstance                 = useRef(null);
  const markersRef                  = useRef([]);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const role  = localStorage.getItem('role');
      const url   = role === 'ADMIN'
        ? 'http://localhost:8080/api/admin/complaints'
        : role === 'OFFICER'
        ? 'http://localhost:8080/api/officer/complaints'
        : 'http://localhost:8080/api/citizen/my-complaints';
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    import('leaflet').then(L => {
      const Lf = L.default;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      delete Lf.Icon.Default.prototype._getIconUrl;
      Lf.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = Lf.map(mapRef.current).setView([20.2961, 85.8245], 12);
      Lf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      mapInstance.current = map;

      // Clear old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Add markers
      const filtered = filter === 'ALL'
        ? complaints
        : complaints.filter(c => c.status?.toUpperCase() === filter);

      filtered.forEach(c => {
        if (!c.latitude || !c.longitude) return;

        const color = statusColor[c.status?.toUpperCase()] || '#888';

        const icon = Lf.divIcon({
          className: '',
          html: `
            <div style="
              width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
              background: ${color}; transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const marker = Lf.marker([c.latitude, c.longitude], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: Outfit, sans-serif; min-width: 180px;">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${c.title}</div>
              <div style="font-size: 12px; color: #6b9e80; margin-bottom: 8px;">${c.description || ''}</div>
              <span style="
                padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
                background: ${color}22; color: ${color};
                border: 1px solid ${color}44;
              ">${c.status?.replace('_', ' ')}</span>
              ${c.citizenName ? `<div style="margin-top: 8px; font-size: 11px; color: #888;">👤 ${c.citizenName}</div>` : ''}
            </div>
          `);

        marker.on('click', () => setSelected(c));
        markersRef.current.push(marker);
      });
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [complaints, filter, loading]);

  const stats = [
    { label: 'Total',       value: complaints.length,                                                          color: '#1a4731', bg: '#e8f5e9' },
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
            <h1 style={s.headerTitle}>🗺️ Complaint Map</h1>
            <p style={s.headerSub}>View all complaints pinned on the live map</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          ...s.statsGrid,
          opacity:   mounted ? 1 : 0,
          transition: 'all 0.6s ease 0.1s',
        }}>
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

        {/* Filter + Legend */}
        <div style={{
          ...s.toolBar,
          opacity:   mounted ? 1 : 0,
          transition: 'all 0.6s ease 0.2s',
        }}>
          <div style={s.filterRow}>
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
          </div>
          <div style={s.legend}>
            {Object.entries(statusColor).map(([status, color]) => (
              <div key={status} style={s.legendItem}>
                <div style={{ ...s.legendDot, background: color }} />
                <span style={s.legendLabel}>{status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div style={{
          ...s.mapWrapper,
          opacity:   mounted ? 1 : 0,
          transition: 'all 0.6s ease 0.3s',
        }}>
          {loading ? (
            <div style={s.loadingBox}>
              <p style={{ color: '#6b9e80' }}>Loading map...</p>
            </div>
          ) : (
            <div ref={mapRef} style={s.map} />
          )}

          {/* Selected complaint panel */}
          {selected && (
            <div style={s.infoPanel}>
              <div style={s.infoPanelHeader}>
                <h3 style={s.infoPanelTitle}>{selected.title}</h3>
                <button
                  style={s.closeBtn}
                  onClick={() => setSelected(null)}
                >✕</button>
              </div>
              <p style={s.infoPanelDesc}>{selected.description}</p>
              <div style={s.infoPanelGrid}>
                <div style={s.infoPanelItem}>
                  <span style={s.infoPanelLabel}>Status</span>
                  <span style={{
                    ...s.infoPanelValue,
                    color: statusColor[selected.status?.toUpperCase()],
                    fontWeight: '700',
                  }}>
                    {selected.status?.replace('_', ' ')}
                  </span>
                </div>
                <div style={s.infoPanelItem}>
                  <span style={s.infoPanelLabel}>Citizen</span>
                  <span style={s.infoPanelValue}>{selected.citizenName}</span>
                </div>
                <div style={s.infoPanelItem}>
                  <span style={s.infoPanelLabel}>Officer</span>
                  <span style={s.infoPanelValue}>
                    {selected.assignedOfficerName || 'Not assigned'}
                  </span>
                </div>
                <div style={s.infoPanelItem}>
                  <span style={s.infoPanelLabel}>Location</span>
                  <span style={s.infoPanelValue}>
                    {selected.latitude?.toFixed(4)}, {selected.longitude?.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

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
  statsGrid:      { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  statCard:       { borderRadius: '14px', padding: '20px 24px', border: '1px solid #e0ede5', cursor: 'default', transition: 'all 0.2s ease' },
  statNum:        { fontSize: '32px', fontWeight: '700' },
  statLabel:      { fontSize: '13px', color: '#6b9e80', marginTop: '4px', fontWeight: '500' },
  toolBar:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
  filterRow:      { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterBtn:      { padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  legend:         { display: 'flex', gap: '16px', alignItems: 'center' },
  legendItem:     { display: 'flex', alignItems: 'center', gap: '6px' },
  legendDot:      { width: '12px', height: '12px', borderRadius: '50%' },
  legendLabel:    { fontSize: '12px', color: '#6b9e80', fontWeight: '500' },
  mapWrapper:     { position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e0ede5', boxShadow: '0 4px 20px rgba(26,71,49,0.08)' },
  map:            { height: '560px', width: '100%' },
  loadingBox:     { height: '560px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' },
  infoPanel:      { position: 'absolute', bottom: '20px', left: '20px', background: '#fff', borderRadius: '16px', padding: '20px', width: '300px', boxShadow: '0 8px 32px rgba(26,71,49,0.15)', border: '1px solid #e0ede5', zIndex: 1000 },
  infoPanelHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  infoPanelTitle: { fontSize: '15px', fontWeight: '700', color: '#1a2e1f', margin: 0, flex: 1 },
  closeBtn:       { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#6b9e80', padding: '0 0 0 8px' },
  infoPanelDesc:  { fontSize: '13px', color: '#6b9e80', marginBottom: '16px', lineHeight: '1.5' },
  infoPanelGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  infoPanelItem:  { display: 'flex', flexDirection: 'column', gap: '3px' },
  infoPanelLabel: { fontSize: '10px', color: '#6b9e80', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' },
  infoPanelValue: { fontSize: '13px', color: '#1a2e1f', fontWeight: '500' },
};

export default MapViewPage;