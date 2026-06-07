import { useEffect, useState, type CSSProperties } from 'react'
import { supabase } from '../supabase'
import CycleLogger from './CycleLogger'
import DailyLogger from './DailyLogger'
import Insights from './Insights'
import { calculatePCOSScore, getPCOSRiskLevel } from '../lib/pcosScore'

type NavItem = 'home' | 'cycle' | 'daily' | 'insights'

const navItems: Array<{ id: NavItem; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'cycle', label: 'Log Cycle' },
  { id: 'daily', label: 'Daily Log' },
  { id: 'insights', label: 'AI Insights' },
]

export default function Dashboard() {
  const [activeItem, setActiveItem] = useState<NavItem>('home')
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleLogout = async () => {
    setIsSigningOut(true)
    await supabase.auth.signOut()
    setIsSigningOut(false)
  }

  return (
    <main style={styles.shell}>
      <aside style={styles.sidebar}>
        <div>
          <p style={styles.brand}>🌙 Luna</p>
          <nav aria-label="Dashboard navigation" style={styles.nav}>
            {navItems.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveItem(item.id)}
                style={{
                  ...styles.navButton,
                  ...(activeItem === item.id ? styles.navButtonActive : null),
                }}
              >
                &gt; {item.label}
              </button>
            ))}
          </nav>
        </div>

        <button type="button" onClick={handleLogout} disabled={isSigningOut} style={styles.logoutButton}>
          {isSigningOut ? 'Logging out...' : 'Logout'}
        </button>
      </aside>

      <section style={styles.main}>
        <div style={styles.panel}>
          {activeItem === 'home' && <HomePanel setActive={setActiveItem} />}
          {activeItem === 'cycle' && <CycleLogger />}
          {activeItem === 'daily' && <DailyLogger />}
          {activeItem === 'insights' && <Insights />}
        </div>
      </section>
    </main>
  )
}

function HomePanel({ setActive }: { setActive: (id: NavItem) => void }) {
  const [lastPeriod, setLastPeriod] = useState<string | null>(null)
  const [daysUntil, setDaysUntil] = useState<number | null>(null)
  const [loggedToday, setLoggedToday] = useState<boolean>(false)
  const [pcosScore, setPcosScore] = useState(0)
  const [riskLevel, setRiskLevel] = useState<'low' | 'moderate' | 'high'>('low')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const getData = async () => {
      setLoading(true)
      setError(null)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user?.id) {
          if (mounted) setError('Not signed in')
          return
        }

        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
          today.getDate()
        ).padStart(2, '0')}`

        const [cyclesRes, logsRes] = await Promise.all([
          supabase
            .from('cycles')
            .select('start_date,cycle_length')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false })
            .limit(6),
          supabase
            .from('daily_logs')
            .select('facial_hair,skin_condition,mood,spotting,blood_clotting,log_date')
            .eq('user_id', user.id)
            .order('log_date', { ascending: false })
            .limit(120),
        ])

        if (cyclesRes.error) throw cyclesRes.error
        if (logsRes.error) throw logsRes.error

        const cycles = (cyclesRes.data ?? []) as Array<{ start_date?: string; cycle_length?: number }>

        if (cycles.length > 0) {
          const last = cycles[0].start_date ?? null
          if (mounted) setLastPeriod(last)

          const lengths = cycles.map(c => c.cycle_length).filter(Boolean) as number[]
          const avg = lengths.length ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : 28

          if (last) {
            const lastDate = new Date(last)
            const nextDate = new Date(lastDate)
            nextDate.setDate(nextDate.getDate() + avg)
            const diffMs = nextDate.getTime() - new Date(todayStr).getTime()
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
            if (mounted) setDaysUntil(diffDays)
          }
        } else {
          if (mounted) {
            setLastPeriod(null)
            setDaysUntil(null)
          }
        }

        const logs = (logsRes.data ?? []) as Array<{
          facial_hair?: string
          skin_condition?: string
          mood?: string
          spotting?: boolean
          blood_clotting?: boolean
          log_date?: string
        }>

        if (mounted) {
          setLoggedToday(logs.some(log => log.log_date === todayStr))
          const score = calculatePCOSScore(logs, cycles)
          const riskLevel = getPCOSRiskLevel(score)
          setPcosScore(score)
          setRiskLevel(riskLevel)
        }
      } catch (err: unknown) {
        if (mounted) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void getData()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div>
      <h1 style={styles.title}>Overview</h1>
      <h2 style={{ marginTop: 8, marginBottom: 12 }}>Good evening 🌙</h2>

      {loading ? (
        <p style={styles.subtitle}>Loading your overview…</p>
      ) : error ? (
        <p style={{ color: '#b00020' }}>Error: {error}</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, padding: 16, borderRadius: 12, background: '#fff', border: '1px solid #efe0e8' }}>
              <p style={{ margin: 0, color: '#7d4d61', fontWeight: 700 }}>Last period</p>
              <p style={{ margin: '8px 0 0', fontSize: '1.1rem' }}>{lastPeriod ?? 'No data'}</p>
            </div>
            <div style={{ flex: 1, padding: 16, borderRadius: 12, background: '#fff', border: '1px solid #efe0e8' }}>
              <p style={{ margin: 0, color: '#7d4d61', fontWeight: 700 }}>Days until next</p>
              <p style={{ margin: '8px 0 0', fontSize: '1.1rem' }}>{daysUntil == null ? '—' : `${daysUntil} days`}</p>
            </div>
            <div style={{ flex: 1, padding: 16, borderRadius: 12, background: '#fff', border: '1px solid #efe0e8' }}>
              <p style={{ margin: 0, color: '#7d4d61', fontWeight: 700 }}>Today's log</p>
              <p style={{ margin: '8px 0 0', fontSize: '1.1rem' }}>{loggedToday ? 'Logged' : 'Not logged'}</p>
            </div>
            <div style={{ flex: 1, padding: 16, borderRadius: 12, background: '#fff', border: '1px solid #efe0e8' }}>
              <p style={{ margin: 0, color: '#7d4d61', fontWeight: 700 }}>PCOS Risk</p>
              <p style={{ margin: '8px 0 0', fontSize: '1.1rem' }}>
                {pcosScore}/100 — {riskLevel}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setActive('daily')}
              style={{ padding: '12px 16px', borderRadius: 12, background: 'linear-gradient(135deg, #cb5b86, #9f3f6a)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              Log Today
            </button>
            <button
              onClick={() => setActive('insights')}
              style={{ padding: '12px 16px', borderRadius: 12, background: '#fff', border: '1px solid #e6bfd0', color: '#9f3f6a', fontWeight: 700, cursor: 'pointer' }}
            >
              View Insights
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  shell: {
    minHeight: '100svh',
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    background: '#fff7fb',
    color: '#231923',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '28px 22px',
    borderRight: '1px solid rgba(191, 83, 126, 0.14)',
    background: 'linear-gradient(180deg, #fff 0%, #fff7fb 100%)',
  },
  brand: {
    margin: 0,
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#b14b72',
  },
  nav: {
    display: 'grid',
    gap: '10px',
    marginTop: '24px',
  },
  navButton: {
    width: '100%',
    border: '1px solid transparent',
    borderRadius: '14px',
    background: 'transparent',
    color: '#3c2d35',
    padding: '12px 14px',
    textAlign: 'left',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  navButtonActive: {
    borderColor: '#e6bfd0',
    background: '#fff',
    color: '#9f3f6a',
    boxShadow: '0 10px 24px rgba(157, 72, 103, 0.08)',
  },
  logoutButton: {
    marginTop: '24px',
    border: '1px solid #e6bfd0',
    borderRadius: '14px',
    background: '#fff',
    color: '#9f3f6a',
    padding: '12px 14px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  main: {
    padding: '28px',
  },
  panel: {
    minHeight: '100%',
    borderRadius: '28px',
    border: '1px solid rgba(191, 83, 126, 0.14)',
    background: 'rgba(255, 255, 255, 0.92)',
    boxShadow: '0 20px 50px rgba(157, 72, 103, 0.12)',
    padding: '32px',
  },
  kicker: {
    margin: 0,
    color: '#b14b72',
    fontSize: '0.9rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '12px 0 10px',
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    lineHeight: 1.05,
  },
  subtitle: {
    margin: 0,
    maxWidth: '56ch',
    color: '#6d5d67',
    fontSize: '1rem',
    lineHeight: 1.6,
  },
}
