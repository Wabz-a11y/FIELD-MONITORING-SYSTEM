import { useState, useEffect, useRef } from 'react'
import { Sprout, BarChart2, Users, Bell, Shield, Smartphone, MapPin, Mail, Phone, ChevronDown, Menu, X, ArrowRight, CheckCircle } from 'lucide-react'

const ADMIN_URL  = import.meta.env.VITE_ADMIN_URL  || 'https://smartseason-admin.vercel.app'
const HERO_IMG   = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1400&q=80'
const STEP_IMGS  = [
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=700&q=75',
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=700&q=75',
  'https://images.unsplash.com/photo-1595855759920-86582396756a?w=700&q=75',
]
const ABOUT_IMG  = 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80'

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function Reveal({ children, delay = 0, dir = 'up' }: { children: React.ReactNode; delay?: number; dir?: 'up'|'left'|'right' }) {
  const { ref, visible } = useInView()
  const anims = { up: 'fadeUp', left: 'slideInLeft', right: 'slideInRight' }
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, animation: visible ? `${anims[dir]} .7s cubic-bezier(.22,.68,0,1.2) ${delay}ms both` : 'none' }}>
      {children}
    </div>
  )
}

function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [v, setV] = useState(0); const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; obs.disconnect()
      let s = 0; const step = () => { s += Math.ceil(end / 48); if (s >= end) { setV(end); return }; setV(s); requestAnimationFrame(step) }
      requestAnimationFrame(step)
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect()
  }, [end])
  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [navOpen, setNavOpen]   = useState(false)
  useEffect(() => { const h = () => setScrolled(window.scrollY > 40); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h) }, [])

  const S = { fontFamily: 'Plus Jakarta Sans,sans-serif' }
  const H = { fontFamily: 'Outfit,sans-serif' }
  const navLinks = ['Features', 'How it Works', 'About', 'Contact']

  return (
    <div style={{ background: '#0a0618', color: '#f5f0ff', fontFamily: 'Plus Jakarta Sans,sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideInLeft{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes pulse2{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes growR{from{width:0;opacity:0}to{opacity:.65}}
        .lbtn{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:10px;font-size:.95rem;font-weight:700;transition:all .2s;white-space:nowrap;cursor:pointer;border:none;text-decoration:none}
        .lbtn-purple{background:linear-gradient(135deg,#6C3FC5,#4e2d9a);color:#fff;box-shadow:0 4px 20px rgba(108,63,197,.4)}
        .lbtn-purple:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(108,63,197,.55)}
        .lbtn-green{background:linear-gradient(135deg,#5cb857,#3d9439);color:#fff;box-shadow:0 4px 20px rgba(92,184,87,.35)}
        .lbtn-green:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(92,184,87,.45)}
        .lbtn-outline{background:transparent;color:#f5f0ff;border:2px solid rgba(255,255,255,.18)}
        .lbtn-outline:hover{border-color:#9b67e8;color:#9b67e8}
        .lcont{max-width:1140px;margin:0 auto;padding:0 24px}
        .lsect{padding:96px 0}
        @media(max-width:768px){.lsect{padding:60px 0}.lnav-links{display:none!important}.lmenu-btn{display:flex!important}.lgrid-3{grid-template-columns:1fr!important}.lgrid-2{grid-template-columns:1fr!important}}
        @media(max-width:540px){.lstats-grid{grid-template-columns:1fr 1fr!important}.lbtn{padding:11px 20px;font-size:.875rem}}
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? 'rgba(10,6,24,.93)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,.06)' : 'none', transition: 'all .3s' }}>
        <div className="lcont" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#6C3FC5"/><path d="M20 7C20 7 11 14.5 11 21.5C11 26.2 15.03 30 20 30C24.97 30 29 26.2 29 21.5C29 14.5 20 7 20 7Z" fill="#7FD67A"/><path d="M20 13C20 13 16 17 16 21.5C16 23.98 17.79 26 20 26C22.21 26 24 23.98 24 21.5C24 17 20 13 20 13Z" fill="white" fillOpacity=".88"/><path d="M20 26V33" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            <span style={{ ...H, fontWeight: 800, fontSize: '1.05rem' }}>SmartSeason</span>
          </div>
          <div className="lnav-links" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {navLinks.map(l => <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} style={{ fontSize: '.875rem', fontWeight: 500, color: 'rgba(255,255,255,.6)', transition: 'color .15s' }} onMouseEnter={e=>(e.currentTarget.style.color='white')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,.6)')}>{l}</a>)}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <a href={ADMIN_URL} className="lbtn lbtn-outline" style={{ padding: '8px 16px', fontSize: '.85rem' }}>Admin</a>
            <a href="/register" className="lbtn lbtn-green" style={{ padding: '8px 16px', fontSize: '.85rem' }}>Agent Sign Up</a>
            <button className="lmenu-btn" onClick={()=>setNavOpen(o=>!o)} style={{ display: 'none', background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}>
              {navOpen ? <X size={22}/> : <Menu size={22}/>}
            </button>
          </div>
        </div>
        {navOpen && (
          <div style={{ background: 'rgba(10,6,24,.98)', borderTop: '1px solid rgba(255,255,255,.07)', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {navLinks.map(l => <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} onClick={()=>setNavOpen(false)} style={{ color: 'rgba(255,255,255,.75)', fontWeight: 500 }}>{l}</a>)}
            <div style={{ display: 'flex', gap: 10, paddingTop: 6 }}>
              <a href={ADMIN_URL} className="lbtn lbtn-outline" style={{ flex: 1, justifyContent: 'center' }}>Admin Login</a>
              <a href="/register" className="lbtn lbtn-green"   style={{ flex: 1, justifyContent: 'center' }}>Agent Sign Up</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src={HERO_IMG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .22 }}/>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(10,6,24,.88) 0%,rgba(20,10,50,.75) 50%,rgba(10,6,24,.92) 100%)' }}/>
        </div>
        <div style={{ position: 'absolute', top: '12%', right: '6%', width: 380, height: 380, background: 'radial-gradient(circle,rgba(108,63,197,.28),transparent 70%)', borderRadius: '50%', animation: 'float 6s ease-in-out infinite', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: '18%', left: '4%', width: 280, height: 280, background: 'radial-gradient(circle,rgba(92,184,87,.18),transparent 70%)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite 2s', pointerEvents: 'none' }}/>
        <div className="lcont" style={{ position: 'relative', zIndex: 2, paddingTop: 130, paddingBottom: 80 }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(127,214,122,.1)', border: '1px solid rgba(127,214,122,.3)', borderRadius: 99, padding: '5px 14px', marginBottom: 22, animation: 'fadeUp .8s ease' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7FD67A', animation: 'pulse2 2s infinite' }}/>
              <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#7FD67A', textTransform: 'uppercase', letterSpacing: '.07em' }}>Built for Kenya's growing season</span>
            </div>
            <h1 style={{ ...H, fontSize: 'clamp(2.2rem,5.5vw,3.8rem)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1.1, marginBottom: 18, animation: 'fadeUp .8s .1s both' }}>
              Smart Field Monitoring<br/><span style={{ background: 'linear-gradient(135deg,#9b67e8,#7FD67A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>for Modern Farms</span>
            </h1>
            <p style={{ fontSize: 'clamp(.95rem,2vw,1.1rem)', color: 'rgba(245,240,255,.65)', lineHeight: 1.7, marginBottom: 34, maxWidth: 560, animation: 'fadeUp .8s .2s both' }}>
              Track crop progress, monitor field health in real time, and coordinate your agents — all from one intelligent platform designed for Nairobi's agricultural ecosystem.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'fadeUp .8s .3s both' }}>
              <a href="/register" className="lbtn lbtn-green">Get Started Free <ArrowRight size={17}/></a>
              <a href="#how-it-works" className="lbtn lbtn-outline">See How It Works <ChevronDown size={17}/></a>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 42, flexWrap: 'wrap', animation: 'fadeUp .8s .5s both' }}>
              {['No credit card required','Free to use','Nairobi-optimised'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '.82rem', color: 'rgba(255,255,255,.45)' }}>
                  <CheckCircle size={14} color="#7FD67A"/>{t}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', animation: 'float 2.2s ease-in-out infinite', opacity: .45, zIndex: 2 }}><ChevronDown size={24} color="white"/></div>
      </section>

      {/* Stats */}
      <div style={{ background: 'rgba(108,63,197,.1)', borderTop: '1px solid rgba(108,63,197,.2)', borderBottom: '1px solid rgba(108,63,197,.2)', padding: '44px 0' }}>
        <div className="lcont">
          <div className="lstats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, textAlign: 'center' }}>
            {[{end:1200,suf:'+',lbl:'Fields Monitored'},{end:340,suf:'+',lbl:'Active Agents'},{end:98,suf:'%',lbl:'Platform Uptime'},{end:24,suf:'/7',lbl:'Support'}].map(s => (
              <Reveal key={s.lbl}>
                <div style={{ ...H, fontSize: 'clamp(1.7rem,3.5vw,2.6rem)', fontWeight: 900, background: 'linear-gradient(135deg,#9b67e8,#7FD67A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}><Counter end={s.end} suffix={s.suf}/></div>
                <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.45)', marginTop: 4, fontWeight: 600 }}>{s.lbl}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="lsect">
        <div className="lcont">
          <Reveal><div className="section-tag" style={{ background: 'rgba(108,63,197,.15)', border: '1px solid rgba(108,63,197,.3)', color: '#9b67e8', padding: '4px 13px', borderRadius: 99, fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Sprout size={12}/>Features</div></Reveal>
          <Reveal delay={80}><h2 style={{ ...H, fontSize: 'clamp(1.7rem,3.5vw,2.6rem)', fontWeight: 900, letterSpacing: '-.03em', marginBottom: 14 }}>Everything your farm needs,<br/><span style={{ background: 'linear-gradient(135deg,#9b67e8,#7FD67A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>in one place</span></h2></Reveal>
          <Reveal delay={140}><p style={{ color: 'rgba(245,240,255,.55)', marginBottom: 52, maxWidth: 540 }}>From planting to harvest, SmartSeason gives coordinators and agents the tools they need to stay aligned.</p></Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 18 }}>
            {[
              { icon: <BarChart2 size={22}/>, title: 'Live Dashboard',       desc: 'Real-time overview of all fields, status breakdowns, and at-risk alerts — updated as agents log observations.',   color: '#6C3FC5' },
              { icon: <Sprout size={22}/>,    title: 'Lifecycle Tracking',    desc: 'Track every crop from Planted → Growing → Ready → Harvested with automatic status computation.',                  color: '#5cb857' },
              { icon: <Users size={22}/>,     title: 'Agent Coordination',    desc: 'Assign fields to agents, monitor their activity, and get instant alerts when a field needs attention.',           color: '#f59e0b' },
              { icon: <Bell size={22}/>,      title: 'Smart Notifications',   desc: 'In-app and email alerts on low health scores, overdue harvests, or agents who haven\'t checked in.',              color: '#ef4444' },
              { icon: <Shield size={22}/>,    title: 'Secure Auth',           desc: 'Argon2id passwords, JWT sessions, email verification, role separation — production-grade security.',              color: '#9b67e8' },
              { icon: <Smartphone size={22}/>,title: 'Mobile Responsive',     desc: 'Field agents can log updates from their phones, directly from the field — no desktop required.',                  color: '#7FD67A' },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 70}>
                <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 26, transition: 'all .2s', cursor: 'default' }}
                  onMouseEnter={e => { (e.currentTarget as any).style.background = 'rgba(108,63,197,.1)'; (e.currentTarget as any).style.borderColor = 'rgba(108,63,197,.3)' }}
                  onMouseLeave={e => { (e.currentTarget as any).style.background = 'rgba(255,255,255,.04)'; (e.currentTarget as any).style.borderColor = 'rgba(255,255,255,.08)' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: `${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 14 }}>{f.icon}</div>
                  <h3 style={{ ...H, fontWeight: 700, fontSize: '1rem', marginBottom: 7 }}>{f.title}</h3>
                  <p style={{ fontSize: '.85rem', color: 'rgba(245,240,255,.5)', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: '96px 0', background: 'rgba(255,255,255,.02)', borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <div className="lcont">
          <Reveal><h2 style={{ ...H, fontSize: 'clamp(1.7rem,3.5vw,2.5rem)', fontWeight: 900, letterSpacing: '-.03em', marginBottom: 14 }}>Three steps from setup<br/><span style={{ background: 'linear-gradient(135deg,#9b67e8,#7FD67A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>to harvest</span></h2></Reveal>
          <div className="lgrid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, marginTop: 52 }}>
            {['Admin creates fields and assigns agents','Agents log observations from the field','Dashboard surfaces at-risk crops automatically'].map((desc, i) => (
              <Reveal key={i} delay={i * 120}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#6C3FC5,#5cb857)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...H, fontWeight: 900, fontSize: '1.5rem', color: 'white' }}>0{i+1}</div>
                  <div style={{ borderRadius: 12, overflow: 'hidden', width: '100%', aspectRatio: '16/9' }}>
                    <img src={STEP_IMGS[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  </div>
                  <p style={{ fontSize: '.9rem', color: 'rgba(245,240,255,.6)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="lsect">
        <div className="lcont">
          <div className="lgrid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <Reveal dir="left">
              <div style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '4/3', position: 'relative' }}>
                <img src={ABOUT_IMG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(108,63,197,.25),rgba(92,184,87,.15))' }}/>
                <div style={{ position: 'absolute', bottom: 18, left: 18, right: 18, background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ ...H, fontWeight: 700, marginBottom: 4, fontSize: '.9rem' }}>"SmartSeason changed how we manage our 50-acre farm."</div>
                  <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.55)' }}>— James Kamau, Farm Coordinator, Kiambu County</div>
                </div>
              </div>
            </Reveal>
            <Reveal dir="right" delay={100}>
              <h2 style={{ ...H, fontSize: 'clamp(1.6rem,3vw,2.3rem)', fontWeight: 900, letterSpacing: '-.03em', marginBottom: 14 }}>Built by farmers,<br/><span style={{ background: 'linear-gradient(135deg,#9b67e8,#7FD67A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>for farmers</span></h2>
              <p style={{ color: 'rgba(245,240,255,.55)', lineHeight: 1.7, marginBottom: 16, fontSize: '.95rem' }}>SmartSeason was built to solve a real problem — farm coordinators losing track of field progress, agents filling paper forms, and harvests being missed.</p>
              <p style={{ color: 'rgba(245,240,255,.55)', lineHeight: 1.7, marginBottom: 26, fontSize: '.95rem' }}>We built a system that works with Nairobi's growing seasons, timezone, and the reality of field work.</p>
              {['Role-based access for coordinators & agents','Automated at-risk detection, no manual checks','Real-time Africa/Nairobi timezone throughout'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <CheckCircle size={15} color="#7FD67A"/>
                  <span style={{ fontSize: '.875rem', color: 'rgba(245,240,255,.6)' }}>{item}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" style={{ padding: '96px 0', background: 'rgba(255,255,255,.02)', borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <div className="lcont">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <Reveal><h2 style={{ ...H, fontSize: 'clamp(1.6rem,3vw,2.3rem)', fontWeight: 900, letterSpacing: '-.03em' }}>Get in touch</h2></Reveal>
            <Reveal delay={80}><p style={{ color: 'rgba(245,240,255,.5)', marginTop: 10 }}>Our team is based in Nairobi and ready to help.</p></Reveal>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, maxWidth: 820, margin: '0 auto' }}>
            {[
              { icon: <Mail size={20}/>,  label: 'Email',    val: 'support@smartseason.app', color: '#6C3FC5' },
              { icon: <Phone size={20}/>, label: 'Phone',    val: '+254 700 000 000',         color: '#5cb857' },
              { icon: <MapPin size={20}/>,label: 'Location', val: 'Westlands, Nairobi',       color: '#f59e0b' },
              { icon: <Bell size={20}/>,  label: 'Hours',    val: 'Mon–Fri 8am–6pm EAT',      color: '#9b67e8' },
            ].map(c => (
              <Reveal key={c.label}>
                <div style={{ display: 'flex', gap: 14, padding: '20px 22px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `${c.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,.35)', marginBottom: 3 }}>{c.label}</div>
                    <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{c.val}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '72px 0' }}>
        <div className="lcont">
          <Reveal>
            <div style={{ background: 'linear-gradient(135deg,rgba(108,63,197,.22),rgba(92,184,87,.12))', border: '1px solid rgba(108,63,197,.28)', borderRadius: 24, padding: '52px 44px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, background: 'radial-gradient(circle,rgba(108,63,197,.28),transparent 70%)', borderRadius: '50%' }}/>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ ...H, fontWeight: 900, fontSize: 'clamp(1.5rem,3.5vw,2.4rem)', letterSpacing: '-.03em', marginBottom: 10 }}>Ready to transform your farm?</h2>
                <p style={{ color: 'rgba(245,240,255,.55)', marginBottom: 28 }}>Join Kenyan farms already using SmartSeason.</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href={ADMIN_URL+'/register'} className="lbtn lbtn-purple">Start as Coordinator</a>
                  <a href="/register"             className="lbtn lbtn-green">Register as Agent</a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,.07)', padding: '36px 0 20px' }}>
        <div className="lcont">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#6C3FC5"/><path d="M20 7C20 7 11 14.5 11 21.5C11 26.2 15.03 30 20 30C24.97 30 29 26.2 29 21.5C29 14.5 20 7 20 7Z" fill="#7FD67A"/></svg>
              <span style={{ ...H, fontWeight: 800, fontSize: '.95rem' }}>SmartSeason</span>
            </div>
            <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)' }}>© {new Date().getFullYear()} SmartSeason · Nairobi, Kenya · support@smartseason.app</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
