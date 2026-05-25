import { useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export interface CycleLoggerData {
  startDate: string
  endDate: string
  painLevel: string
  flowIntensity: 'light' | 'medium' | 'heavy'
  notes: string
}

interface CycleLoggerProps {
  onComplete?: (data: CycleLoggerData) => void
}

const initialData: CycleLoggerData = {
  startDate: '',
  endDate: '',
  painLevel: '1',
  flowIntensity: 'medium',
  notes: '',
}

export default function CycleLogger({ onComplete }: CycleLoggerProps) {
  const [formData, setFormData] = useState(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target

    setFormData(previous => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const cycleLength = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

      const payload: Record<string, unknown> = {
        start_date: formData.startDate,
        end_date: formData.endDate || null,
        pain_level: Number(formData.painLevel),
        flow_intensity: formData.flowIntensity,
        notes: formData.notes || null,
        cycle_length: cycleLength,
      }

      if (user?.id) payload.user_id = user.id

      const { error } = await supabase.from('cycles').insert(payload)

      if (error) {
        setErrorMessage(error.message)
      } else {
        onComplete?.(formData)
        setIsComplete(true)
        setFormData(initialData)
      }
    } catch (err: any) {
      setErrorMessage(err?.message ?? String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card} aria-labelledby="cycle-logger-title">
        <p style={styles.kicker}>Cycle tracker</p>
        <h1 id="cycle-logger-title" style={styles.title}>
          Log a cycle
        </h1>
        <p style={styles.subtitle}>Capture the basics of this cycle so you can review patterns later.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.field}>
            <span style={styles.label}>Start date</span>
            <input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>End date</span>
            <input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Pain level</span>
            <input
              name="painLevel"
              type="number"
              min="1"
              max="10"
              step="1"
              value={formData.painLevel}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Flow intensity</span>
            <select
              name="flowIntensity"
              value={formData.flowIntensity}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="heavy">Heavy</option>
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Notes</span>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Anything notable about this cycle"
              rows={4}
              style={styles.textarea}
            />
          </label>

          <button type="submit" disabled={isSubmitting} style={styles.button}>
            {isSubmitting ? 'Saving...' : 'Save cycle'}
          </button>
        </form>

        {isComplete && <p style={styles.success}>Your cycle was saved to Supabase.</p>}
        {errorMessage && <p style={styles.error}>Error: {errorMessage}</p>}
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
    maxWidth: '560px',
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
  form: {
    display: 'grid',
    gap: '16px',
    marginTop: '28px',
  },
  field: {
    display: 'grid',
    gap: '8px',
  },
  label: {
    color: '#3c2d35',
    fontSize: '0.95rem',
    fontWeight: 600,
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: '14px',
    border: '1px solid #dec9d2',
    background: '#fff',
    color: '#231923',
    padding: '14px 16px',
    fontSize: '1rem',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: '14px',
    border: '1px solid #dec9d2',
    background: '#fff',
    color: '#231923',
    padding: '14px 16px',
    fontSize: '1rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  button: {
    marginTop: '4px',
    border: 'none',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #cb5b86, #9f3f6a)',
    color: '#fff',
    padding: '14px 18px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  success: {
    marginTop: '18px',
    color: '#7d4d61',
    fontSize: '0.95rem',
  },
  error: {
    marginTop: '12px',
    color: '#b00020',
    fontSize: '0.95rem',
  },
}