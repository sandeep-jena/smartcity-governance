import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Particle canvas
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5, dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4, alpha: Math.random() * 0.6 + 0.2,
    }));
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(76,175,125,${p.alpha})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      particles.forEach((a, i) => particles.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(76,175,125,${0.12 * (1 - d / 120)})`; ctx.lineWidth = 0.6; ctx.stroke();
        }
      }));
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
};

// Animated counter
const Counter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
};

// Feature card
const FeatureCard = ({ icon, title, desc, delay }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      ...fc.card,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      transition: `all 0.7s ease ${delay}s`,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(76,175,125,0.2)'; e.currentTarget.style.borderColor = 'rgba(76,175,125,0.4)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
    >
      <div style={fc.icon}>{icon}</div>
      <h3 style={fc.title}>{title}</h3>
      <p style={fc.desc}>{desc}</p>
    </div>
  );
};

const fc = {
  card:  { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px 28px', transition: 'all 0.3s ease', cursor: 'default', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' },
  icon:  { fontSize: '40px', marginBottom: '16px' },
  title: { fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '10px', fontFamily: "'Syne', sans-serif" },
  desc:  { fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.7', margin: 0 },
};

const LandingPage = () => {
  const [mounted, setMounted]       = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const features = [
    { icon: '📍', title: 'Location-Based Reporting', desc: 'Pin exact complaint locations on an interactive map. Officers know exactly where to go.' },
    { icon: '⚡', title: 'Real-Time Updates', desc: 'WebSocket-powered live notifications keep citizens and officers in sync instantly.' },
    { icon: '👮', title: 'Officer Assignment', desc: 'Admins assign complaints to field officers with one click. Email alerts sent automatically.' },
    { icon: '📊', title: 'Smart Dashboard', desc: 'Role-based dashboards for Citizens, Officers, and Admins with analytics and insights.' },
    { icon: '🗺️', title: 'Live Complaint Map', desc: 'View all city complaints color-coded by status on a real-time OpenStreetMap.' },
    { icon: '🔐', title: 'Secure & Role-Based', desc: 'JWT authentication with three distinct roles — Citizen, Officer, and Admin.' },
  ];

  const steps = [
    { num: '01', title: 'Register & Login',      desc: 'Create your account as a Citizen, Officer, or Admin in seconds.' },
    { num: '02', title: 'Submit a Complaint',    desc: 'Describe the issue, select a category, and pin the exact location on the map.' },
    { num: '03', title: 'Admin Assigns Officer', desc: 'The admin reviews complaints and assigns a field officer with email notification.' },
    { num: '04', title: 'Issue Gets Resolved',   desc: 'Officer updates the status in real-time. Citizen gets notified when resolved.' },
  ];

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a1f13; }
        ::-webkit-scrollbar-thumb { background: #4caf7d; border-radius: 3px; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes orbPulse { 0%,100% { transform: scale(1); opacity: 0.15; } 50% { transform: scale(1.3); opacity: 0.25; } }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes scrollPills { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        ...s.nav,
        background: scrolled ? 'rgba(10,31,19,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.3)' : 'none',
      }}>
        <div style={s.navInner}>
          <div style={s.navLogo} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={s.logoBox}>🏙️</div>
            <span style={s.logoText}>SmartCity</span>
          </div>

          {/* Desktop Nav */}
          <div style={s.navLinks}>
            {['features', 'how-it-works', 'stats', 'contact'].map(id => (
              <button key={id} style={s.navLink} onClick={() => scrollTo(id)}
                onMouseEnter={e => e.target.style.color = '#4caf7d'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
              >
                {id === 'how-it-works' ? 'How It Works' : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>

          <div style={s.navActions}>
            <button style={s.navLoginBtn} onClick={() => navigate('/login')}
              onMouseEnter={e => { e.target.style.background = 'rgba(76,175,125,0.2)'; e.target.style.borderColor = '#4caf7d'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            >
              Sign In
            </button>
            <button style={s.navRegisterBtn} onClick={() => navigate('/register')}
              onMouseEnter={e => { e.target.style.background = '#2d6a4f'; e.target.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.target.style.background = '#4caf7d'; e.target.style.transform = 'translateY(0)'; }}
            >
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <ParticleCanvas />
        <div style={s.orb1} />
        <div style={s.orb2} />
        <div style={s.orb3} />

        <div style={s.heroContent}>
          <div style={{
            ...s.heroBadge,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease 0.1s',
          }}>
            🏙️ Smart City Governance Portal
          </div>

          <h1 style={{
            ...s.heroTitle,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease 0.2s',
          }}>
            Your City.<br />
            <span style={s.heroAccent}>Your Voice.</span><br />
            Resolved Fast.
          </h1>

          <p style={{
            ...s.heroSub,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.4s',
          }}>
            Report city issues, track resolutions in real-time, and connect with local authorities — all in one powerful platform built for Bhubaneswar.
          </p>

          <div style={{
            ...s.heroButtons,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.5s',
          }}>
            <button style={s.heroPrimary} onClick={() => navigate('/register')}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(76,175,125,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(76,175,125,0.3)'; }}
            >
              🚀 Report an Issue
            </button>
            <button style={s.heroSecondary} onClick={() => navigate('/login')}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Sign In →
            </button>
          </div>

          {/* Scrolling pills */}
          <div style={{
            ...s.pillTrack,
            opacity: mounted ? 1 : 0,
            transition: 'all 1s ease 0.8s',
          }}>
            <div style={s.pillInner}>
              {['📍 Location Pins', '🔔 Live Alerts', '🗺️ City Map', '✅ Fast Resolution',
                '📊 Analytics', '🛡️ Secure', '👮 Officers', '🏛️ Government',
                '📍 Location Pins', '🔔 Live Alerts', '🗺️ City Map', '✅ Fast Resolution'].map((p, i) => (
                <span key={i} style={s.pill}>{p}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={s.scrollIndicator} onClick={() => scrollTo('features')}>
          <div style={s.scrollDot} />
          <span style={s.scrollText}>Scroll to explore</span>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" style={s.statsSection}>
        <div style={s.statsGrid}>
          {[
            { target: 12000, suffix: '+', label: 'Citizens Served'    },
            { target: 98,    suffix: '%', label: 'Resolution Rate'    },
            { target: 500,   suffix: '+', label: 'Issues Resolved'    },
            { target: 24,    suffix: '/7', label: 'Support Available' },
          ].map((stat, i) => (
            <div key={i} style={s.statItem}>
              <div style={s.statNum}>
                <Counter target={stat.target} suffix={stat.suffix} />
              </div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={s.featuresSection}>
        <div style={s.sectionHeader}>
          <div style={s.sectionTag}>✨ Features</div>
          <h2 style={s.sectionTitle}>Everything You Need to<br />Govern Smarter</h2>
          <p style={s.sectionSub}>A complete platform connecting citizens, officers, and administrators for efficient city management.</p>
        </div>
        <div style={s.featuresGrid}>
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} delay={i * 0.1} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={s.howSection}>
        <div style={s.sectionHeader}>
          <div style={s.sectionTag}>📋 Process</div>
          <h2 style={s.sectionTitle}>How SmartCity Works</h2>
          <p style={s.sectionSub}>From complaint to resolution in four simple steps.</p>
        </div>
        <div style={s.stepsGrid}>
          {steps.map((step, i) => (
            <div key={i} style={s.stepCard}>
              <div style={s.stepNum}>{step.num}</div>
              <div style={s.stepConnector} />
              <h3 style={s.stepTitle}>{step.title}</h3>
              <p style={s.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section style={s.rolesSection}>
        <div style={s.sectionHeader}>
          <div style={s.sectionTag}>👥 Roles</div>
          <h2 style={s.sectionTitle}>Built for Everyone</h2>
        </div>
        <div style={s.rolesGrid}>
          {[
            { icon: '👤', role: 'Citizen',  color: '#4caf7d', desc: 'Submit complaints, track status, view issues on the map in real-time.', actions: ['Submit Complaints', 'Track Status', 'View Map', 'Get Notifications'] },
            { icon: '👮', role: 'Officer',  color: '#f39c12', desc: 'Receive assignments, update status, resolve complaints efficiently.', actions: ['View Assignments', 'Update Status', 'Mark Resolved', 'Email Alerts'] },
            { icon: '🛡️', role: 'Admin',    color: '#e74c3c', desc: 'Manage all complaints, assign officers, view analytics and all users.', actions: ['All Complaints', 'Assign Officers', 'Manage Users', 'Full Analytics'] },
          ].map((r, i) => (
            <div key={i} style={{ ...s.roleCard, borderTop: `3px solid ${r.color}` }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.3)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)'; }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>{r.icon}</div>
              <h3 style={{ ...s.roleTitle, color: r.color }}>{r.role}</h3>
              <p style={s.roleDesc}>{r.desc}</p>
              <div style={s.roleActions}>
                {r.actions.map((a, j) => (
                  <span key={j} style={{ ...s.roleAction, background: `${r.color}18`, color: r.color, border: `1px solid ${r.color}33` }}>
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="contact" style={s.ctaSection}>
        <div style={s.ctaOrb1} />
        <div style={s.ctaOrb2} />
        <div style={s.ctaContent}>
          <h2 style={s.ctaTitle}>Ready to Make Your City Better?</h2>
          <p style={s.ctaSub}>Join thousands of citizens already using SmartCity to improve Bhubaneswar.</p>
          <div style={s.ctaButtons}>
            <button style={s.ctaPrimary} onClick={() => navigate('/register')}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(76,175,125,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(76,175,125,0.3)'; }}
            >
              🚀 Get Started Free
            </button>
            <button style={s.ctaSecondary} onClick={() => navigate('/login')}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerBrand}>
            <div style={s.footerLogo}>
              <span style={{ fontSize: '24px' }}>🏙️</span>
              <span style={s.footerLogoText}>SmartCity</span>
            </div>
            <p style={s.footerTagline}>Empowering citizens to build a better Bhubaneswar, one complaint at a time.</p>
          </div>
          <div style={s.footerLinks}>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Platform</div>
              {['Features', 'How It Works', 'Security', 'API'].map(l => (
                <div key={l} style={s.footerLink}>{l}</div>
              ))}
            </div>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Roles</div>
              {['Citizen Portal', 'Officer Dashboard', 'Admin Panel', 'Register'].map(l => (
                <div key={l} style={s.footerLink}>{l}</div>
              ))}
            </div>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Contact</div>
              {['smartcity@bbsr.gov.in', 'Bhubaneswar, Odisha', 'India - 751001'].map(l => (
                <div key={l} style={s.footerLink}>{l}</div>
              ))}
            </div>
          </div>
        </div>
        <div style={s.footerBottom}>
          <span>© 2026 SmartCity Governance Portal. Built for Bhubaneswar.</span>
          <span style={{ color: '#4caf7d' }}>Made with ❤️ in Odisha</span>
        </div>
      </footer>
    </div>
  );
};

const s = {
  root:          { background: '#0a1f13', minHeight: '100vh', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' },
  nav:           { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, transition: 'all 0.3s ease', padding: '0 40px' },
  navInner:      { maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' },
  navLogo:       { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  logoBox:       { fontSize: '28px' },
  logoText:      { fontSize: '20px', fontWeight: '800', color: '#fff', fontFamily: "'Syne', sans-serif" },
  navLinks:      { display: 'flex', gap: '32px' },
  navLink:       { background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'color 0.2s', fontFamily: "'Outfit', sans-serif" },
  navActions:    { display: 'flex', gap: '12px', alignItems: 'center' },
  navLoginBtn:   { padding: '8px 20px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Outfit', sans-serif" },
  navRegisterBtn:{ padding: '8px 20px', background: '#4caf7d', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Outfit', sans-serif" },
  hero:          { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '120px 40px 80px' },
  orb1:          { position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,175,125,0.15), transparent 70%)', top: '-200px', left: '-200px', animation: 'orbPulse 6s ease-in-out infinite' },
  orb2:          { position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,175,125,0.1), transparent 70%)', bottom: '-100px', right: '-100px', animation: 'orbPulse 8s ease-in-out infinite 2s' },
  orb3:          { position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,175,125,0.2), transparent 70%)', top: '40%', right: '20%', animation: 'orbPulse 5s ease-in-out infinite 1s' },
  heroContent:   { position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '800px' },
  heroBadge:     { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(76,175,125,0.15)', border: '1px solid rgba(76,175,125,0.3)', borderRadius: '20px', padding: '8px 20px', fontSize: '13px', color: '#4caf7d', fontWeight: '600', marginBottom: '24px', letterSpacing: '0.5px' },
  heroTitle:     { fontSize: '72px', fontWeight: '800', color: '#fff', lineHeight: '1.1', fontFamily: "'Syne', sans-serif", marginBottom: '24px' },
  heroAccent:    { background: 'linear-gradient(135deg, #4caf7d, #a8e6c3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  heroSub:       { fontSize: '18px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px' },
  heroButtons:   { display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '60px' },
  heroPrimary:   { padding: '16px 36px', background: '#4caf7d', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 20px rgba(76,175,125,0.3)', fontFamily: "'Outfit', sans-serif" },
  heroSecondary: { padding: '16px 36px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: "'Outfit', sans-serif" },
  pillTrack:     { overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)', marginTop: '20px' },
  pillInner:     { display: 'flex', gap: '12px', width: 'max-content', animation: 'scrollPills 20s linear infinite' },
  pill:          { padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: 'rgba(76,175,125,0.12)', border: '1px solid rgba(76,175,125,0.2)', color: '#4caf7d', whiteSpace: 'nowrap' },
  scrollIndicator:{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', zIndex: 2 },
  scrollDot:     { width: '24px', height: '40px', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '12px', position: 'relative', display: 'flex', justifyContent: 'center', paddingTop: '6px' },
  scrollText:    { fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' },
  statsSection:  { background: 'rgba(76,175,125,0.06)', borderTop: '1px solid rgba(76,175,125,0.15)', borderBottom: '1px solid rgba(76,175,125,0.15)', padding: '60px 40px' },
  statsGrid:     { maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', textAlign: 'center' },
  statItem:      { display: 'flex', flexDirection: 'column', gap: '8px' },
  statNum:       { fontSize: '48px', fontWeight: '800', color: '#4caf7d', fontFamily: "'Syne', sans-serif" },
  statLabel:     { fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' },
  featuresSection:{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' },
  sectionHeader: { textAlign: 'center', marginBottom: '60px' },
  sectionTag:    { display: 'inline-block', background: 'rgba(76,175,125,0.15)', border: '1px solid rgba(76,175,125,0.3)', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', color: '#4caf7d', fontWeight: '600', marginBottom: '16px', letterSpacing: '1px' },
  sectionTitle:  { fontSize: '44px', fontWeight: '800', color: '#fff', fontFamily: "'Syne', sans-serif", lineHeight: '1.2', marginBottom: '16px' },
  sectionSub:    { fontSize: '16px', color: 'rgba(255,255,255,0.5)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.7' },
  featuresGrid:  { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
  howSection:    { padding: '100px 40px', background: 'rgba(0,0,0,0.2)' },
  stepsGrid:     { maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' },
  stepCard:      { textAlign: 'center', padding: '32px 20px', position: 'relative' },
  stepNum:       { fontSize: '48px', fontWeight: '800', color: 'rgba(76,175,125,0.3)', fontFamily: "'Syne', sans-serif", marginBottom: '16px' },
  stepConnector: { width: '40px', height: '2px', background: 'linear-gradient(90deg, #4caf7d, transparent)', margin: '0 auto 16px' },
  stepTitle:     { fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '10px', fontFamily: "'Syne', sans-serif" },
  stepDesc:      { fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7' },
  rolesSection:  { padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' },
  rolesGrid:     { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
  roleCard:      { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '36px 28px', transition: 'all 0.3s ease', cursor: 'default', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' },
  roleTitle:     { fontSize: '22px', fontWeight: '700', marginBottom: '12px', fontFamily: "'Syne', sans-serif" },
  roleDesc:      { fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.7', marginBottom: '20px' },
  roleActions:   { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  roleAction:    { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  ctaSection:    { padding: '120px 40px', position: 'relative', overflow: 'hidden', textAlign: 'center' },
  ctaOrb1:       { position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,175,125,0.15), transparent 70%)', top: '-200px', left: '50%', transform: 'translateX(-50%)', animation: 'orbPulse 6s ease-in-out infinite' },
  ctaOrb2:       { position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,175,125,0.1), transparent 70%)', bottom: '-100px', right: '10%', animation: 'orbPulse 8s ease-in-out infinite 2s' },
  ctaContent:    { position: 'relative', zIndex: 2, maxWidth: '600px', margin: '0 auto' },
  ctaTitle:      { fontSize: '52px', fontWeight: '800', color: '#fff', fontFamily: "'Syne', sans-serif", marginBottom: '16px', lineHeight: '1.2' },
  ctaSub:        { fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '40px', lineHeight: '1.7' },
  ctaButtons:    { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' },
  ctaPrimary:    { padding: '18px 48px', background: '#4caf7d', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 20px rgba(76,175,125,0.3)', fontFamily: "'Outfit', sans-serif" },
  ctaSecondary:  { padding: '12px 32px', background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Outfit', sans-serif" },
  footer:        { background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 40px 30px' },
  footerInner:   { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: '60px', marginBottom: '40px' },
  footerBrand:   { maxWidth: '280px' },
  footerLogo:    { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  footerLogoText:{ fontSize: '20px', fontWeight: '800', color: '#fff', fontFamily: "'Syne', sans-serif" },
  footerTagline: { fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.7' },
  footerLinks:   { display: 'flex', gap: '60px' },
  footerCol:     { display: 'flex', flexDirection: 'column', gap: '12px' },
  footerColTitle:{ fontSize: '13px', fontWeight: '700', color: '#4caf7d', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' },
  footerLink:    { fontSize: '13px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' },
  footerBottom:  { maxWidth: '1200px', margin: '0 auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.3)' },
};

export default LandingPage;