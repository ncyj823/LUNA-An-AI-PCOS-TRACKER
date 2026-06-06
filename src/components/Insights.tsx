import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { supabase } from '../lib/supabase'
import { generatePCOSInsight } from '../lib/gemini'

type DailyLogRow = {
  id?: string
  user_id?: string
  log_date?: string
  mood?: string
  energy_level?: number
  bleeding_flow?: string
  blood_clotting?: boolean
  skin_condition?: string
  facial_hair?: string
  sleep_hours?: number
  spotting?: boolean
  notes?: string | null
}

type CycleRow = {
  id?: string
  user_id?: string
  start_date?: string
  end_date?: string | null
  pain_level?: number
  flow_intensity?: string
  cycle_length?: number
  notes?: string | null
}

export default function Insights() {
  const [logs, setLogs] = useState<DailyLogRow[]>([])
  const [cycles, setCycles] = useState<CycleRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [insightText, setInsightText] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user?.id) {
          setErrorMessage('Please sign in to view AI insights.')
          setLogs([])
          setCycles([])
          return
        }

        const [logsResponse, cyclesResponse] = await Promise.all([
          supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('log_date', { ascending: false })
            .limit(120),
          supabase.from('cycles').select('*').eq('user_id', user.id).order('start_date', { ascending: false }).limit(48),
        ])

        if (logsResponse.error) {
          throw new Error(logsResponse.error.message)
        }

        if (cyclesResponse.error) {
          throw new Error(cyclesResponse.error.message)
        }

        setLogs((logsResponse.data ?? []) as DailyLogRow[])
        setCycles((cyclesResponse.data ?? []) as CycleRow[])
      } catch (error: unknown) {
        setErrorMessage(error instanceof Error ? error.message : String(error))
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  }, [])

  const hasEnoughData = useMemo(() => logs.length > 15 || cycles.length > 0, [logs.length, cycles.length])

  const handleGenerate = async () => {
    if (!hasEnoughData) {
      setErrorMessage('Add at least one daily log or cycle entry before generating insights.')
      return
    }

    setIsGenerating(true)
    setErrorMessage(null)

    try {
      const insight = await generatePCOSInsight(logs, cycles)
      setInsightText(insight)
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to generate insights right now.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card} aria-labelledby="insights-title">
        <p style={styles.kicker}>AI insights</p>
        <h1 id="insights-title" style={styles.title}>
          Pattern summary for your logs
        </h1>
        <p style={styles.subtitle}>
          Luna reviews your cycle and daily symptom history to highlight patterns that may be worth discussing with your
          doctor.
        </p>

        <div style={styles.statsRow}>
          <article style={styles.statCard}>
            <p style={styles.statLabel}>Daily logs</p>
            <p style={styles.statValue}>{isLoading ? '...' : logs.length}</p>
          </article>
          <article style={styles.statCard}>
            <p style={styles.statLabel}>Cycles</p>
            <p style={styles.statValue}>{isLoading ? '...' : cycles.length}</p>
          </article>
        </div>

        {!isLoading && !hasEnoughData && (
          <p style={styles.notice}>No data found yet. Start by logging at least one daily entry or cycle.</p>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading || isGenerating || !hasEnoughData}
          style={styles.button}
        >
          {isGenerating ? 'Generating insight...' : 'Generate insight'}
        </button>

        {errorMessage && <p style={styles.error}>Error: {errorMessage}</p>}

        {insightText && (
          <article style={styles.output} aria-live="polite">
            <h2 style={styles.outputTitle}>Your insight</h2>
            <pre style={styles.outputText}>{insightText}</pre>
          </article>
        )}
      </section>
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100svh',
    display: 'grid',
    placeItems: 'center',
    padding: '32px 20px',
    background:
      'radial-gradient(circle at top, rgba(255, 197, 220, 0.4), transparent 40%), linear-gradient(180deg, #fffafc 0%, #fff 100%)',
  },
  card: {
    width: '100%',
    maxWidth: '720px',
    borderRadius: '28px',
    border: '1px solid rgba(191, 83, 126, 0.14)',
    background: 'rgba(255, 255, 255, 0.92)',
    boxShadow: '0 20px 50px rgba(157, 72, 103, 0.12)',
    padding: '32px',
    textAlign: 'left',
    backdropFilter: 'blur(12px)',
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
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    lineHeight: 1.05,
    color: '#231923',
  },
  subtitle: {
    margin: 0,
    color: '#6d5d67',
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  statsRow: {
    marginTop: '24px',
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  },
  statCard: {
    borderRadius: '16px',
    padding: '14px 16px',
    border: '1px solid #edd4de',
    background: '#fff8fb',
  },
  statLabel: {
    margin: 0,
    color: '#7d4d61',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  statValue: {
    margin: '8px 0 0',
    color: '#2b1f27',
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  notice: {
    marginTop: '16px',
    color: '#7d4d61',
    fontSize: '0.95rem',
  },
  button: {
    marginTop: '22px',
    border: 'none',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #cb5b86, #9f3f6a)',
    color: '#fff',
    padding: '14px 18px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  error: {
    marginTop: '12px',
    color: '#b00020',
    fontSize: '0.95rem',
  },
  output: {
    marginTop: '22px',
    borderRadius: '16px',
    border: '1px solid #efd8e1',
    background: '#fff',
    padding: '16px',
  },
  outputTitle: {
    margin: '0 0 10px',
    fontSize: '1rem',
    color: '#3c2d35',
  },
  outputText: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    fontSize: '0.98rem',
    lineHeight: 1.65,
    color: '#2d2028',
  },
}
