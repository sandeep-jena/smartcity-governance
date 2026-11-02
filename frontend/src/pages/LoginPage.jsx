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
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 3 + 1, dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6, alpha: Math.random() * 0.5 + 0.2,
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
        if (dist < 100) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(76,175,125,${0.15 * (1 - dist / 100)})`;
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

const Cityskyline = () => (
  <svg viewBox="0 0 400 120" style={{ width: '100%', opacity: 0.15, marginTop: '20px' }}>
    <rect x="10"  y="60"  width="30" height="60" fill="#4caf7d" />
    <rect x="15"  y="40"  width="20" height="20" fill="#4caf7d" />
    <rect x="50"  y="30"  width="40" height="90" fill="#4caf7d" />
    <rect x="58"  y="20"  width="8"  height="12" fill="#4caf7d" />
    <rect x="100" y="50"  width="35" height="70" fill="#4caf7d" />
    <rect x="145" y="20"  width="50" height="100" fill="#4caf7d" />
    <rect x="163" y="5"   width="8"  height="18" fill="#4caf7d" />
    <rect x="205" y="40"  width="40" height="80" fill="#4caf7d" />
    <rect x="255" y="55"  width="30" height="65" fill="#4caf7d" />
    <rect x="295" y="25"  width="45" height="95" fill="#4caf7d" />
    <rect x="310" y="10"  width="10" height="18" fill="#4caf7d" />
    <rect x="350" y="45"  width="35" height="75" fill="#4caf7d" />
  </svg>
);

const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 40);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}{suffix}</span>;
};

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', formData);
      localStorage.setItem('token',    res.data.token);
      localStorage.setItem('role',     res.data.role);
      localStorage.setItem('username', res.data.username);
      if (res.data.role === 'ADMIN')        navigate('/admin');
      else if (res.data.role === 'OFFICER') navigate('/officer');
      else                                  navigate('/dashboard');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>

      {/* LEFT PANEL */}
      <div style={s.left}>
        <ParticleCanvas />
        <div style={{ ...s.orb, width: 300, height: 300, top: '-80px',   left: '-80px',  animationDelay: '0s'   }} />
        <div style={{ ...s.orb, width: 200, height: 200, bottom: '40px', right: '-60px', animationDelay: '1.5s' }} />
        <div style={{ ...s.orb, width: 150, height: 150, top: '40%',     left: '60%',    animationDelay: '3s'   }} />

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
            <p style={s.brandSub}>GOVERNANCE PORTAL</p>
          </div>

          <div style={{
            ...s.statsRow,
            opacity:   mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.3s',
          }}>
            {[
              { target: 12, suffix: 'K+', label: 'Citizens' },
              { target: 98, suffix: '%',  label: 'Resolved' },
              { target: 24, suffix: '/7', label: 'Support'  },
            ].map((item) => (
              <div key={item.label} style={s.statBox}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px) scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
              >
                <div style={s.statNum}><Counter target={item.target} suffix={item.suffix} /></div>
                <div style={s.statLabel}>{item.label}</div>
              </div>
            ))}
          </div>

          <div style={{ opacity: mounted ? 1 : 0, transition: 'all 1s ease 0.5s' }}>
            <Cityskyline />
          </div>

          <p style={{
            ...s.tagline,
            opacity:   mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.6s',
          }}>
            Empowering citizens to report, track and resolve city issues — faster than ever.
          </p>

          <div style={s.pillTrack}>
            <div style={s.pillInner}>
              {['📍 Location Tracking', '🔔 Real-time Alerts', '🗺️ Live Map', '✅ Fast Resolution',
                '📊 Analytics', '🛡️ Secure Portal', '📍 Location Tracking', '🔔 Real-time Alerts'].map((pill, i) => (
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
          {/* Card Header with Back Button */}
          <div style={s.cardHeader}>
            <button
              style={s.backHomeBtn}
              onClick={() => navigate('/')}
              onMouseEnter={e => { e.target.style.background = '#f0f7f0'; e.target.style.color = '#1a4731'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#6b9e80'; }}
            >
              ← Back to Home
            </button>
            <h2 style={s.cardTitle}>Welcome back</h2>
            <p style={s.cardSub}>Sign in to your account</p>
          </div>

          {error && <div style={s.errorBox}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={s.field}>
              <label style={s.label}>Username</label>
              <input
                style={s.input} type="text" name="username"
                placeholder="Enter your username"
                value={formData.username} onChange={handleChange}
                onFocus={e => { e.target.style.border = '1.5px solid #4caf7d'; e.target.style.boxShadow = '0 0 0 3px rgba(76,175,125,0.15)'; }}
                onBlur={e  => { e.target.style.border = '1.5px solid #e0ede5'; e.target.style.boxShadow = 'none'; }}
                required
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                style={s.input} type="password" name="password"
                placeholder="Enter your password"
                value={formData.password} onChange={handleChange}
                onFocus={e => { e.target.style.border = '1.5px solid #4caf7d'; e.target.style.boxShadow = '0 0 0 3px rgba(76,175,125,0.15)'; }}
                onBlur={e  => { e.target.style.border = '1.5px solid #e0ede5'; e.target.style.boxShadow = 'none'; }}
                required
              />
            </div>

            <button
              style={loading ? s.btnLoading : s.btn}
              type="submit" disabled={loading}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(26,71,49,0.35)'; }}}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(26,71,49,0.2)'; }}
            >
              {loading ? '⟳ Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={s.divider}>
            <div style={s.dividerLine} />
            <span style={s.dividerText}>New to SmartCity?</span>
            <div style={s.dividerLine} />
          </div>

          <button
            style={s.registerBtn}
            onClick={() => navigate('/register')}
            onMouseEnter={e => { e.target.style.background = '#1a4731'; e.target.style.color = '#fff'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#1a4731'; }}
          >
            Create an Account
          </button>
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
      `}</style>
    </div>
  );
};

const s = {
  page:       { display: 'flex', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" },
  left: {
    width: '48%', background: '#0d2b1e',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    padding: '60px 50px', color: '#fff', position: 'relative', overflow: 'hidden',
  },
  orb: {
    position: 'absolute', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(76,175,125,0.3), transparent 70%)',
    animation: 'orbPulse 4s ease-in-out infinite',
  },
  brand:          { marginBottom: '40px', textAlign: 'left' },
  logoRing:       { position: 'relative', width: '72px', height: '72px', marginBottom: '16px', display: 'inline-block' },
  logoInner:      { width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(76,175,125,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', position: 'relative', zIndex: 1 },
  logoRingBorder: { position: 'absolute', inset: '-6px', borderRadius: '26px', border: '2px dashed rgba(76,175,125,0.5)', animation: 'ringRotate 8s linear infinite' },
  brandTitle:     { fontSize: '40px', fontWeight: '700', color: '#fff', letterSpacing: '1px', margin: '0 0 4px' },
  brandSub:       { fontSize: '12px', color: '#4caf7d', letterSpacing: '4px', margin: 0 },
  statsRow:       { display: 'flex', gap: '12px', marginBottom: '24px' },
  statBox:        { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(76,175,125,0.2)', borderRadius: '14px', padding: '16px', flex: 1, textAlign: 'center', transition: 'transform 0.2s ease', cursor: 'default', backdropFilter: 'blur(10px)' },
  statNum:        { fontSize: '24px', fontWeight: '700', color: '#4caf7d' },
  statLabel:      { fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' },
  tagline:        { fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.8', maxWidth: '340px', marginTop: '8px' },
  pillTrack:      { marginTop: '24px', overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)' },
  pillInner:      { display: 'flex', gap: '10px', width: 'max-content', animation: 'scrollPills 18s linear infinite' },
  pill:           { padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: 'rgba(76,175,125,0.15)', border: '1px solid rgba(76,175,125,0.25)', color: '#4caf7d', whiteSpace: 'nowrap' },
  right:          { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f7f0', padding: '40px' },
  card:           { background: '#fff', borderRadius: '24px', padding: '48px 40px', width: '100%', maxWidth: '420px', border: '1px solid #e0ede5', boxShadow: '0 20px 60px rgba(26,71,49,0.1)' },
  cardHeader:     { marginBottom: '32px' },
  backHomeBtn:    { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid #e0ede5', borderRadius: '8px', padding: '7px 14px', fontSize: '13px', color: '#6b9e80', cursor: 'pointer', marginBottom: '20px', transition: 'all 0.2s ease', fontFamily: "'Outfit', sans-serif" },
  cardTitle:      { fontSize: '28px', fontWeight: '700', color: '#1a2e1f', margin: '0 0 6px' },
  cardSub:        { fontSize: '14px', color: '#6b9e80', margin: 0 },
  field:          { marginBottom: '20px' },
  label:          { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1a4731', marginBottom: '8px' },
  input:          { width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1.5px solid #e0ede5', fontSize: '14px', color: '#1a2e1f', outline: 'none', background: '#f8fbf9', boxSizing: 'border-box', transition: 'border 0.2s, box-shadow 0.2s' },
  btn:            { width: '100%', padding: '14px', marginTop: '8px', background: '#1a4731', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', letterSpacing: '0.5px', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 12px rgba(26,71,49,0.2)' },
  btnLoading:     { width: '100%', padding: '14px', marginTop: '8px', background: '#6b9e80', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'not-allowed' },
  divider:        { display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' },
  dividerLine:    { flex: 1, height: '1px', background: '#e0ede5' },
  dividerText:    { fontSize: '12px', color: '#6b9e80', whiteSpace: 'nowrap' },
  registerBtn:    { width: '100%', padding: '13px', background: 'transparent', color: '#1a4731', border: '1.5px solid #1a4731', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  errorBox:       { background: '#fdf0ef', border: '1px solid #f5c6c2', color: '#c0392b', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '20px' },
};

export default LoginPage;