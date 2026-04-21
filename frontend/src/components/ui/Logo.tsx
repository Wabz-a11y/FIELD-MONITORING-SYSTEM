export default function Logo({ size = 36, collapsed = false }: { size?: number; collapsed?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
        <rect width="40" height="40" rx="10" fill="url(#lg)"/>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40">
            <stop stopColor="#3d9439"/><stop offset="1" stopColor="#2a6e27"/>
          </linearGradient>
        </defs>
        <path d="M20 7C20 7 11 14.5 11 21.5C11 26.2 15.03 30 20 30C24.97 30 29 26.2 29 21.5C29 14.5 20 7 20 7Z" fill="#7FD67A"/>
        <path d="M20 13C20 13 16 17 16 21.5C16 23.98 17.79 26 20 26C22.21 26 24 23.98 24 21.5C24 17 20 13 20 13Z" fill="white" fillOpacity=".88"/>
        <path d="M20 26V33" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 33H24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity=".4"/>
      </svg>
      {!collapsed && (
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1rem', color: 'white', letterSpacing: '-.03em' }}>SmartSeason</div>
          <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '.6rem', color: 'rgba(255,255,255,.5)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em' }}>Field Agent</div>
        </div>
      )}
    </div>
  )
}
