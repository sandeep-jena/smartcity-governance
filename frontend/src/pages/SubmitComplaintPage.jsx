import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import axios from 'axios';

const CATEGORIES = [
  { icon: '🏗️', label: 'Infrastructure & Roads'          },
  { icon: '💡', label: 'Street Lighting & Electricity'   },
  { icon: '💧', label: 'Water Supply & Drainage'         },
  { icon: '🗑️', label: 'Garbage & Sanitation'            },
  { icon: '🌿', label: 'Environment & Pollution'         },
  { icon: '🚦', label: 'Traffic & Transport'             },
  { icon: '🏛️', label: 'Public Property & Facility'      },
  { icon: '⚖️', label: 'Law & Safety'                    },
  { icon: '🐾', label: 'Animal & Pet'                    },
  { icon: '🏥', label: 'Health & Hygiene'                },
  { icon: '🏢', label: 'Civic Services & Governance'     },
  { icon: '🚨', label: 'Emergency Issues'                },
];

const MapPicker = ({ onPick }) => {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const markerRef   = useRef(null);

  useEffect(() => {
    import('leaflet').then(L => {
      const Lf = L.default;
      if (mapInstance.current) return;

      delete Lf.Icon.Default.prototype._getIconUrl;
      Lf.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = Lf.map(mapRef.current).setView([20.2961, 85.8245], 13);
      Lf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      mapInstance.current = map;

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) markerRef.current.remove();
        markerRef.current = Lf.marker([lat, lng]).addTo(map)
          .bindPopup('📍 Complaint location').openPopup();
        onPick(lat, lng);
      });
    });
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div
        ref={mapRef}
        style={{
          height: '280px', borderRadius: '12px',
          border: '1.5px solid #e0ede5', overflow: 'hidden',
        }}
      />
      <p style={{ fontSize: '12px', color: '#6b9e80', marginTop: '8px' }}>
        📍 Click anywhere on the map to drop a pin at the complaint location
      </p>
    </div>
  );
};

const SubmitComplaintPage = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', category: '',
    latitude: null, longitude: null,
     image: null,
  imagePreview: null
  });
  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');
  const [mounted, setMounted]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNextStep = () => {
    if (!formData.category) { setError('Please select a category'); return; }
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.title)       { setError('Please enter a title');            return; }
  if (!formData.description) { setError('Please enter a description');      return; }
  if (!formData.latitude)    { setError('Please pick a location on the map'); return; }

  setLoading(true);
  setError('');
  try {
    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('title',       formData.title);
    data.append('description', formData.description);
    data.append('latitude',    formData.latitude.toString());
    data.append('longitude',   formData.longitude.toString());
    if (formData.image) data.append('image', formData.image);

    await axios.post('http://localhost:8080/api/citizen/complaints', data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
        
        
      }
    });
    setSuccess(true);
    setTimeout(() => navigate('/complaints'), 2500);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to submit. Try again.');
  } finally {
    setLoading(false);
  }
};

  
  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: '10px',
    border: '1.5px solid #e0ede5', fontSize: '14px', color: '#1a2e1f',
    outline: 'none', background: '#f8fbf9', boxSizing: 'border-box',
    transition: 'border 0.2s, box-shadow 0.2s', fontFamily: "'Outfit', sans-serif",
  };

  const focusInput  = e => { e.target.style.border = '1.5px solid #4caf7d'; e.target.style.boxShadow = '0 0 0 3px rgba(76,175,125,0.15)'; };
  const blurInput   = e => { e.target.style.border = '1.5px solid #e0ede5'; e.target.style.boxShadow = 'none'; };

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
            <h1 style={s.headerTitle}>Submit a Complaint</h1>
            <p style={s.headerSub}>Report an issue in your city — we'll get it resolved</p>
          </div>
          <button style={s.backBtn} onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{
          ...s.progressBox,
          opacity:   mounted ? 1 : 0,
          transition: 'all 0.6s ease 0.1s',
        }}>
          {['Select Category', 'Fill Details', 'Pick Location'].map((label, i) => (
            <div key={i} style={s.progressStep}>
              <div style={{
                ...s.progressDot,
                background: i <= step ? '#1a4731' : '#e0ede5',
                color:      i <= step ? '#fff'    : '#6b9e80',
                transform:  i === step ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.3s ease',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <div style={{
                ...s.progressLabel,
                color:      i <= step ? '#1a4731' : '#6b9e80',
                fontWeight: i === step ? '600'    : '400',
              }}>
                {label}
              </div>
              {i < 2 && (
                <div style={{
                  ...s.progressLine,
                  background: i < step ? '#1a4731' : '#e0ede5',
                  transition: 'background 0.4s ease',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Success State */}
        {success ? (
          <div style={s.successCard}>
            <div style={s.successIcon}>🎉</div>
            <h2 style={s.successTitle}>Complaint Submitted!</h2>
            <p style={s.successSub}>Your complaint has been registered. Redirecting to your complaints...</p>
            <div style={s.successBarWrap}>
              <div style={s.successBarFill} />
            </div>
          </div>
        ) : (
          <div style={{
            ...s.card,
            opacity:   mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease 0.2s',
          }}>

            {error && <div style={s.errorBox}>⚠️ {error}</div>}

            {/* STEP 0 — Category */}
            {step === 0 && (
              <div>
                <h3 style={s.stepTitle}>What type of issue is this?</h3>
                <p style={s.stepSub}>Select the category that best describes your complaint</p>
                <div style={s.categoryGrid}>
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat.label}
                      style={{
                        ...s.categoryCard,
                        border:     formData.category === cat.label ? '2px solid #4caf7d'         : '1.5px solid #e0ede5',
                        background: formData.category === cat.label ? 'rgba(76,175,125,0.08)'     : '#fff',
                        transform:  formData.category === cat.label ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
                      }}
                      onClick={() => { setFormData({ ...formData, category: cat.label }); setError(''); }}
                      onMouseEnter={e => { if (formData.category !== cat.label) e.currentTarget.style.background = '#f8fbf9'; }}
                      onMouseLeave={e => { if (formData.category !== cat.label) e.currentTarget.style.background = '#fff'; }}
                    >
                      <div style={s.categoryIcon}>{cat.icon}</div>
                      <div style={s.categoryLabel}>{cat.label}</div>
                      {formData.category === cat.label && (
                        <div style={s.categoryCheck}>✓</div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  style={s.btn}
                  onClick={handleNextStep}
                  onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(26,71,49,0.3)'; }}
                  onMouseLeave={e => { e.target.style.transform = 'translateY(0)';    e.target.style.boxShadow = '0 4px 12px rgba(26,71,49,0.2)'; }}
                >
                  Continue →
                </button>
              </div>
            )}

            {/* STEP 1 — Details + Map */}
            {step === 1 && (
              <form onSubmit={handleSubmit}>
                <h3 style={s.stepTitle}>Describe the issue</h3>
                <p style={s.stepSub}>Provide details and pin the exact location on the map</p>

                {/* Selected category badge */}
                <div style={s.selectedBadge}>
                  <span>{CATEGORIES.find(c => c.label === formData.category)?.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a4731' }}>{formData.category}</span>
                  <span
                    style={{ fontSize: '12px', color: '#6b9e80', cursor: 'pointer', marginLeft: 'auto' }}
                    onClick={() => setStep(0)}
                  >
                    Change
                  </span>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Complaint Title</label>
                  <input
                    style={inputStyle} type="text" name="title"
                    placeholder="e.g. Large pothole near main market"
                    value={formData.title} onChange={handleChange}
                    onFocus={focusInput} onBlur={blurInput} required
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Description</label>
                  <textarea
                    style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
                    name="description"
                    placeholder="Describe the issue in detail — when did it start, how severe is it, who is affected..."
                    value={formData.description} onChange={handleChange}
                    onFocus={focusInput} onBlur={blurInput} required
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>📍 Pin Location on Map</label>
                  <MapPicker onPick={(lat, lng) => setFormData(f => ({ ...f, latitude: lat, longitude: lng }))} />
                  {formData.latitude && (
                    <div style={s.coordBadge}>
                      ✅ Location selected: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                    </div>
                  )}
                </div>

                {/* 📷 Image Upload */}
<div style={s.field}>
  <label style={s.label}>📷 Attach Photo of the Issue (optional)</label>

  <div
    style={{
      ...s.uploadBox,
      borderColor: formData.imagePreview ? '#4caf7d' : '#e0ede5',
    }}
    onClick={() => document.getElementById('complaintImg')?.click()}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = '#4caf7d';
      e.currentTarget.style.background = 'rgba(76,175,125,0.04)';
    }}
    onMouseLeave={e => {
      if (!formData.imagePreview) {
        e.currentTarget.style.borderColor = '#e0ede5';
        e.currentTarget.style.background = '#f8fbf9';
      }
    }}
  >
    {formData.imagePreview ? (
      <img
        src={formData.imagePreview}
        alt="Preview"
        style={{
          maxHeight: '160px',
          maxWidth: '100%',
          borderRadius: '8px',
          objectFit: 'cover'
        }}
      />
    ) : (
      <>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>📎</div>
        <p style={{ color: '#6b9e80', fontSize: '14px', margin: 0 }}>
          Click to upload a photo
        </p>
        <p style={{ color: '#b0c4ba', fontSize: '12px', margin: '4px 0 0' }}>
          PNG, JPG up to 5MB
        </p>
      </>
    )}

    {/* Hidden File Input */}
    <input
      id="complaintImg"
      type="file"
      accept="image/png, image/jpeg, image/jpg"
      style={{ display: 'none' }}
      onChange={(e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Image must be under 5MB');
          return;
        }

        //  Validate type (extra safety)
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed');
          return;
        }

        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: URL.createObjectURL(file)
        }));

        setError('');
      }}
    />
  </div>

  {/*  Remove Button */}
  {formData.imagePreview && (
    <button
      type="button"
      style={s.removeImg}
      onClick={() =>
        setFormData(prev => ({
          ...prev,
          image: null,
          imagePreview: null
        }))
      }
    >
      ✕ Remove photo
    </button>
  )}
</div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    style={s.backBtnForm} type="button" onClick={() => setStep(0)}
                    onMouseEnter={e => { e.target.style.background = '#f0f7f0'; }}
                    onMouseLeave={e => { e.target.style.background = 'transparent'; }}
                  >
                    ← Back
                  </button>
                  <button
                    style={loading ? s.btnDisabled : s.btn}
                    type="submit" disabled={loading}
                    onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(26,71,49,0.3)'; }}}
                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(26,71,49,0.2)'; }}
                  >
                    {loading ? 'Submitting...' : '🚀 Submit Complaint'}
                  </button>
                </div>
              </form>
            )}

          </div>
        )}
      </div>

      <style>{`
        @keyframes fillBar {
          from { width: 0%;   }
          to   { width: 100%; }
        }
        @keyframes successPop {
          0%   { transform: scale(0);   opacity: 0; }
          70%  { transform: scale(1.1);             }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const s = {
  layout:       { display: 'flex', minHeight: '100vh', background: '#f0f7f0', fontFamily: "'Outfit', sans-serif" },
  main:         { marginLeft: '240px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 240px)' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerTitle:  { fontSize: '24px', fontWeight: '700', color: '#1a2e1f', margin: 0 },
  headerSub:    { fontSize: '14px', color: '#6b9e80', marginTop: '4px' },
  backBtn:      { padding: '10px 18px', background: '#fff', color: '#1a4731', border: '1.5px solid #e0ede5', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  progressBox:  { display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '14px', padding: '20px 32px', marginBottom: '24px', border: '1px solid #e0ede5' },
  progressStep: { display: 'flex', alignItems: 'center', gap: '10px' },
  progressDot:  { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', flexShrink: 0 },
  progressLabel:{ fontSize: '13px', color: '#6b9e80', whiteSpace: 'nowrap' },
  progressLine: { width: '60px', height: '2px', borderRadius: '1px', margin: '0 8px' },
  card:         { background: '#fff', borderRadius: '20px', padding: '36px', border: '1px solid #e0ede5', boxShadow: '0 4px 40px rgba(26,71,49,0.06)' },
  stepTitle:    { fontSize: '20px', fontWeight: '700', color: '#1a2e1f', margin: '0 0 6px' },
  stepSub:      { fontSize: '14px', color: '#6b9e80', marginBottom: '24px' },
  categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' },
  categoryCard: { borderRadius: '12px', padding: '16px 12px', textAlign: 'center', cursor: 'pointer', position: 'relative', transition: 'all 0.2s ease' },
  categoryIcon: { fontSize: '28px', marginBottom: '8px' },
  categoryLabel:{ fontSize: '12px', fontWeight: '600', color: '#1a2e1f', lineHeight: '1.3' },
  categoryCheck:{ position: 'absolute', top: '8px', right: '10px', fontSize: '12px', color: '#4caf7d', fontWeight: '700' },
  selectedBadge:{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(76,175,125,0.08)', border: '1px solid rgba(76,175,125,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px', fontSize: '18px' },
  field:        { marginBottom: '20px' },
  label:        { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1a4731', marginBottom: '8px' },
  coordBadge:   { marginTop: '8px', padding: '8px 12px', background: 'rgba(76,175,125,0.1)', border: '1px solid rgba(76,175,125,0.2)', borderRadius: '8px', fontSize: '12px', color: '#1a4731', fontWeight: '500' },
  btn:          { flex: 1, width: '100%', padding: '14px', background: '#1a4731', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 12px rgba(26,71,49,0.2)' },
  btnDisabled:  { flex: 1, width: '100%', padding: '14px', background: '#6b9e80', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'not-allowed' },
  backBtnForm:  { padding: '14px 20px', background: 'transparent', color: '#1a4731', border: '1.5px solid #e0ede5', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap' },
  errorBox:     { background: '#fdf0ef', border: '1px solid #f5c6c2', color: '#c0392b', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '20px' },
  successCard:  { background: '#fff', borderRadius: '20px', padding: '60px 40px', textAlign: 'center', border: '1px solid #e0ede5' },
  successIcon:  { fontSize: '64px', display: 'block', marginBottom: '16px', animation: 'successPop 0.6s cubic-bezier(0.175,0.885,0.32,1.275) both' },
  successTitle: { fontSize: '26px', fontWeight: '700', color: '#1a2e1f', margin: '0 0 8px' },
  successSub:   { fontSize: '14px', color: '#6b9e80', marginBottom: '28px' },
  successBarWrap:{ height: '4px', background: '#e0ede5', borderRadius: '2px', overflow: 'hidden', maxWidth: '300px', margin: '0 auto' },
  successBarFill:{ height: '100%', background: '#4caf7d', borderRadius: '2px', animation: 'fillBar 2.5s ease forwards' },

  uploadBox: {
  border: '2px dashed #e0ede5',
  borderRadius: '12px',
  padding: '28px',
  textAlign: 'center',
  cursor: 'pointer',
  background: '#f8fbf9',
  transition: 'all 0.2s ease',
},

removeImg: {
  marginTop: '8px',
  background: 'none',
  border: 'none',
  color: '#e74c3c',
  fontSize: '13px',
  cursor: 'pointer',
  fontFamily: "'Outfit', sans-serif",
},
};

export default SubmitComplaintPage;