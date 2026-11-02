import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 3 + 1, dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5, alpha: Math.random() * 0.5 + 0.2,
    }));
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(76,175,125,${p.alpha})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      particles.forEach((a, i) => particles.slice(i + 1).forEach(b => {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 90) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(76,175,125,${0.12 * (1 - dist / 90)})`;
          ctx.lineWidth = 0.8; ctx.stroke();
        }
      }));
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
};

const StepIndicator = ({ current, total }) => (
  <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} style={{
        height: '4px', flex: 1, borderRadius: '2px',
        background: i < current ? '#1a4731' : i === current ? '#4caf7d' : '#e0ede5',
        transition: 'all 0.4s ease',
      }} />
    ))}
  </div>
);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '',
    confirmPassword: '', fullName: '', role: ''
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep]       = useState(0);
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.username || !formData.email) {
      setError('Please fill in all fields'); return;
    }
    if (!formData.role) {
      setError('Please select a role'); return;
    }
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        username: formData.username,
        email:    formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role:     formData.role,
      });
      setStep(2);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputProps = (name, type = 'text', placeholder) => ({
    style: s.input, type, name, placeholder,
    value: formData[name], onChange: handleChange,
    onFocus: e => { e.target.style.border = '1.5px solid #4caf7d'; e.target.style.boxShadow = '0 0 0 3px rgba(76,175,125,0.15)'; },
    onBlur:  e => { e.target.style.border = '1.5px solid #e0ede5'; e.target.style.boxShadow = 'none'; },
    required: true,
  });

  return (
    <div style={s.page}>

      {/* LEFT PANEL */}
      <div style={s.left}>
        <ParticleCanvas />
        <div style={{ ...s.orb, width: 280, height: 280, top: '-60px',   left: '-60px',  animationDelay: '0s' }} />
        <div style={{ ...s.orb, width: 180, height: 180, bottom: '60px', right: '-50px', animationDelay: '2s' }} />
        <div style={{ ...s.orb, width: 120, height: 120, top: '45%',     left: '55%',    animationDelay: '4s' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            ...s.brand,
            opacity:   mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease',
          }}>
            <div style={s.logoRing}>
              <div style={s.logoInner}>🏙️</div>
              <div style={s.logoRingBorder} />
            </div>
            <h1 style={s.brandTitle}>SmartCity</h1>
            <p style={s.brandSub}>JOIN THE PLATFORM</p>
          </div>

          <div style={{
            opacity:   mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.3s',
          }}>
            <p style={s.stepsTitle}>How it works</p>
            {[
              { icon: '📝', text: 'Create your account',            active: step >= 0 },
              { icon: '📍', text: 'Submit complaints with location', active: step >= 1 },
              { icon: '🔔', text: 'Get real-time updates',          active: step >= 2 },
              { icon: '✅', text: 'Issues resolved by officers',    active: step >= 2 },
            ].map((item, i) => (
              <div key={i} style={{
                ...s.stepRow,
                opacity:   mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-20px)',
                transition: `all 0.6s ease ${0.4 + i * 0.1}s`,
              }}>
                <div style={{
                  ...s.stepIcon,
                  background: item.active ? 'rgba(76,175,125,0.3)'           : 'rgba(255,255,255,0.06)',
                  border:     item.active ? '1px solid rgba(76,175,125,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.4s ease',
                }}>
                  {item.icon}
                </div>
                <span style={{
                  ...s.stepText,
                  color: item.active ? '#fff' : 'rgba(255,255,255,0.45)',
                  transition: 'color 0.4s ease',
                }}>
                  {item.text}
                </span>
                {item.active && <span style={s.stepCheck}>✓</span>}
              </div>
            ))}
          </div>

          <div style={s.pillTrack}>
            <div style={s.pillInner}>
              {['🔒 Secure', '📊 Analytics', '🗺️ Live Map', '🔔 Alerts',
                '✅ Fast', '🛡️ Safe', '🔒 Secure', '📊 Analytics',
                '🗺️ Live Map', '🔔 Alerts'].map((pill, i) => (
                <span key={i} style={s.pill}>{pill}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={s.right}>
        <div style={{
          ...s.card,
          opacity:   mounted ? 1 : 0,
          transform: mounted ? 'translateX(0)' : 'translateX(40px)',
          transition: 'all 0.8s ease 0.2s',
        }}>

          {/* Success State */}
          {step === 2 ? (
            <div style={s.successBox}>
              <div style={s.successIcon}>🎉</div>
              <h2 style={s.successTitle}>Account Created!</h2>
              <p style={s.successSub}>Redirecting you to login...</p>
              <div style={s.successBar}>
                <div style={s.successBarFill} />
              </div>
            </div>
          ) : (
            <>
              <div style={s.cardHeader}>
                <button
                  style={s.backHomeBtn}
                  onClick={() => navigate('/')}
                  onMouseEnter={e => { e.target.style.background = '#f0f7f0'; e.target.style.color = '#1a4731'; }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#6b9e80'; }}
                >
                  ← Back to Home
                </button>
                <h2 style={s.cardTitle}>Create account</h2>
                <p style={s.cardSub}>
                  Step {step + 1} of 2 — {step === 0 ? 'Your details' : 'Set password'}
                </p>
              </div>

              <StepIndicator current={step} total={2} />

              {error && <div style={s.errorBox}>⚠️ {error}</div>}

              {/* STEP 1 */}
              {step === 0 && (
                <form onSubmit={handleNext}>
                  <div style={s.field}>
                    <label style={s.label}>Full Name</label>
                    <input {...inputProps('fullName', 'text', 'Your full name')} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Username</label>
                    <input {...inputProps('username', 'text', 'Choose a username')} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Email</label>
                    <input {...inputProps('email', 'email', 'Your email address')} />
                  </div>

                  <div style={s.field}>
                    <label style={s.label}>Register As</label>
                    <div style={s.roleGrid}>
                      {[
                        { value: 'CITIZEN', icon: '👤', title: 'Citizen', desc: 'Report city issues' },
                        { value: 'OFFICER', icon: '👮', title: 'Officer', desc: 'Resolve complaints' },
                        { value: 'ADMIN',   icon: '🛡️', title: 'Admin',   desc: 'Manage the system' },
                      ].map((r) => (
                        <div
                          key={r.value}
                          style={{
                            ...s.roleCard,
                            border:     formData.role === r.value ? '2px solid #4caf7d'           : '1.5px solid #e0ede5',
                            background: formData.role === r.value ? 'rgba(76,175,125,0.08)'       : '#f8fbf9',
                            transform:  formData.role === r.value ? 'translateY(-2px) scale(1.02)': 'translateY(0) scale(1)',
                          }}
                          onClick={() => { setFormData({ ...formData, role: r.value }); setError(''); }}
                        >
                          <div style={s.roleIcon}>{r.icon}</div>
                          <div style={s.roleTitle}>{r.title}</div>
                          <div style={s.roleDesc}>{r.desc}</div>
                          {formData.role === r.value && <div style={s.roleCheck}>✓</div>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button style={s.btn} type="submit"
                    onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(26,71,49,0.35)'; }}
                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)';    e.target.style.boxShadow = '0 4px 12px rgba(26,71,49,0.2)';  }}
                  >
                    Continue →
                  </button>
                </form>
              )}

              {/* STEP 2 */}
              {step === 1 && (
                <form onSubmit={handleSubmit}>
                  <div style={s.field}>
                    <label style={s.label}>Password</label>
                    <input {...inputProps('password', 'password', 'Create a strong password')} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Confirm Password</label>
                    <input {...inputProps('confirmPassword', 'password', 'Repeat your password')} />
                  </div>

                  {formData.password && (
                    <div style={s.strengthBox}>
                      <div style={s.strengthBar}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} style={{
                            ...s.strengthSegment,
                            background: formData.password.length >= i * 3
                              ? i <= 1 ? '#e74c3c' : i <= 2 ? '#f39c12' : i <= 3 ? '#4caf7d' : '#1a4731'
                              : '#e0ede5',
                          }} />
                        ))}
                      </div>
                      <span style={s.strengthLabel}>
                        {formData.password.length < 4  ? '🔴 Weak' :
                         formData.password.length < 7  ? '🟡 Fair' :
                         formData.password.length < 10 ? '🟢 Good' : '💪 Strong'}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button style={s.backBtn} type="button" onClick={() => setStep(0)}
                      onMouseEnter={e => { e.target.style.background = '#f0f7f0'; }}
                      onMouseLeave={e => { e.target.style.background = 'transparent'; }}
                    >
                      ← Back
                    </button>
                    <button
                      style={loading ? s.btnLoading : s.btn}
                      type="submit" disabled={loading}
                      onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(26,71,49,0.35)'; }}}
                      onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(26,71,49,0.2)'; }}
                    >
                      {loading ? 'Creating...' : 'Create Account 🎉'}
                    </button>
                  </div>
                </form>
              )}

              <p style={s.loginText}>
                Already have an account?{' '}
                <span style={s.loginLink} onClick={() => navigate('/login')}>Sign in</span>
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes orbPulse {
          0%, 100% { transform: scale(1);   opacity: 0.15; }
          50%       { transform: scale(1.2); opacity: 0.25; }
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes scrollPills {
          from { transform: translateX(0);    }
          to   { transform: translateX(-50%); }
        }
        @keyframes fillBar {
          from { width: 0%;   }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
};

const s = {
  page:           { display: 'flex', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" },
  left:           { width: '42%', background: '#0d2b1e', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '50px 40px', color: '#fff', position: 'relative', overflow: 'hidden' },
  orb:            { position: 'absolute', borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,175,125,0.3), transparent 70%)', animation: 'orbPulse 4s ease-in-out infinite' },
  brand:          { marginBottom: '36px' },
  logoRing:       { position: 'relative', width: '64px', height: '64px', marginBottom: '14px', display: 'inline-block' },
  logoInner:      { width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(76,175,125,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', position: 'relative', zIndex: 1 },
  logoRingBorder: { position: 'absolute', inset: '-6px', borderRadius: '24px', border: '2px dashed rgba(76,175,125,0.5)', animation: 'ringRotate 8s linear infinite' },
  brandTitle:     { fontSize: '34px', fontWeight: '700', color: '#fff', margin: '0 0 4px' },
  brandSub:       { fontSize: '11px', color: '#4caf7d', letterSpacing: '4px', margin: 0 },
  stepsTitle:     { fontSize: '11px', color: '#4caf7d', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '600' },
  stepRow:        { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  stepIcon:       { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 },
  stepText:       { fontSize: '14px', flex: 1 },
  stepCheck:      { fontSize: '12px', color: '#4caf7d', fontWeight: '700' },
  pillTrack:      { marginTop: '28px', overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)' },
  pillInner:      { display: 'flex', gap: '10px', width: 'max-content', animation: 'scrollPills 16s linear infinite' },
  pill:           { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: 'rgba(76,175,125,0.15)', border: '1px solid rgba(76,175,125,0.25)', color: '#4caf7d', whiteSpace: 'nowrap' },
  right:          { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f7f0', padding: '40px' },
  card:           { background: '#fff', borderRadius: '24px', padding: '44px 40px', width: '100%', maxWidth: '440px', border: '1px solid #e0ede5', boxShadow: '0 20px 60px rgba(26,71,49,0.1)' },
  cardHeader:     { marginBottom: '8px' },
  backHomeBtn:    { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid #e0ede5', borderRadius: '8px', padding: '7px 14px', fontSize: '13px', color: '#6b9e80', cursor: 'pointer', marginBottom: '20px', transition: 'all 0.2s ease', fontFamily: "'Outfit', sans-serif" },
  cardTitle:      { fontSize: '26px', fontWeight: '700', color: '#1a2e1f', margin: '0 0 4px' },
  cardSub:        { fontSize: '13px', color: '#6b9e80', margin: 0 },
  field:          { marginBottom: '18px' },
  label:          { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1a4731', marginBottom: '7px' },
  input:          { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e0ede5', fontSize: '14px', color: '#1a2e1f', outline: 'none', background: '#f8fbf9', boxSizing: 'border-box', transition: 'border 0.2s, box-shadow 0.2s' },
  btn:            { flex: 1, width: '100%', padding: '13px', background: '#1a4731', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 12px rgba(26,71,49,0.2)' },
  btnLoading:     { flex: 1, width: '100%', padding: '13px', background: '#6b9e80', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'not-allowed' },
  backBtn:        { padding: '13px 20px', background: 'transparent', color: '#1a4731', border: '1.5px solid #e0ede5', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap' },
  strengthBox:    { marginBottom: '16px' },
  strengthBar:    { display: 'flex', gap: '4px', marginBottom: '6px' },
  strengthSegment:{ flex: 1, height: '4px', borderRadius: '2px', transition: 'background 0.3s ease' },
  strengthLabel:  { fontSize: '12px', color: '#6b9e80' },
  roleGrid:       { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '4px' },
  roleCard:       { borderRadius: '12px', padding: '14px 10px', textAlign: 'center', cursor: 'pointer', position: 'relative', transition: 'all 0.2s ease' },
  roleIcon:       { fontSize: '24px', marginBottom: '6px' },
  roleTitle:      { fontSize: '13px', fontWeight: '700', color: '#1a2e1f', marginBottom: '2px' },
  roleDesc:       { fontSize: '10px', color: '#6b9e80' },
  roleCheck:      { position: 'absolute', top: '6px', right: '8px', fontSize: '11px', color: '#4caf7d', fontWeight: '700' },
  errorBox:       { background: '#fdf0ef', border: '1px solid #f5c6c2', color: '#c0392b', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },
  loginText:      { textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b9e80' },
  loginLink:      { color: '#1a4731', fontWeight: '600', cursor: 'pointer' },
  successBox:     { textAlign: 'center', padding: '20px 0' },
  successIcon:    { fontSize: '64px', display: 'block', marginBottom: '16px' },
  successTitle:   { fontSize: '24px', fontWeight: '700', color: '#1a2e1f', margin: '0 0 8px' },
  successSub:     { fontSize: '14px', color: '#6b9e80', marginBottom: '24px' },
  successBar:     { height: '4px', background: '#e0ede5', borderRadius: '2px', overflow: 'hidden' },
  successBarFill: { height: '100%', background: '#4caf7d', borderRadius: '2px', animation: 'fillBar 2.5s ease forwards' },
};

export default RegisterPage;