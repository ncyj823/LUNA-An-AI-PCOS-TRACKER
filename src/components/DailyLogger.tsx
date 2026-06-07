import { useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export interface DailyLoggerData {
  logDate: string
  mood: 'happy' | 'anxious' | 'irritable' | 'depressed'
  energyLevel: string
  bleedingFlow: 'none' | 'light' | 'medium' | 'heavy'
  bloodClotting: 'yes' | 'no'
  skinCondition: 'clear' | 'oily' | 'acne'
  facialHair: 'none' | 'mild' | 'moderate' | 'severe'
  sleepHours: string
  spotting: 'yes' | 'no'
  notes: string
}

interface DailyLoggerProps {
  onComplete?: (data: DailyLoggerData) => void
}

const getToday = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const today = getToday()

const initialData: DailyLoggerData = {
  logDate: today,
  mood: 'happy',
  energyLevel: '5',
  bleedingFlow: 'none',
  bloodClotting: 'no',
  skinCondition: 'clear',
  facialHair: 'none',
  sleepHours: '8',
  spotting: 'no',
  notes: '',
}

export default function DailyLogger({ onComplete }: DailyLoggerProps) {
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

      const { error } = await supabase.from('daily_logs').insert({
        user_id: user?.id,
        log_date: formData.logDate,
        mood: formData.mood,
        energy_level: Number(formData.energyLevel),
        bleeding_flow: formData.bleedingFlow,
        blood_clotting: formData.bloodClotting === 'yes',
        skin_condition: formData.skinCondition,
        facial_hair: formData.facialHair,
        sleep_hours: Number(formData.sleepHours),
        spotting: formData.spotting === 'yes',
        notes: formData.notes || null,
      })

      if (error) {
        setErrorMessage(error.message)
      } else {
        onComplete?.(formData)
        setIsComplete(true)
        setFormData({
          ...initialData,
          logDate: getToday(),
        })
      }
    } catch (err: any) {
      setErrorMessage(err?.message ?? String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card} aria-labelledby="daily-logger-title">
        <p style={styles.kicker}>Daily check-in</p>
        <h1 id="daily-logger-title" style={styles.title}>
          Log today&apos;s symptoms
        </h1>
        <p style={styles.subtitle}>Capture how you feel today so patterns are easier to spot later.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.field}>
            <span style={styles.label}>Log date</span>
            <input
              name="logDate"
              type="date"
              value={formData.logDate}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Mood</span>
            <select name="mood" value={formData.mood} onChange={handleChange} required style={styles.input}>
              <option value="happy">Happy</option>
              <option value="anxious">Anxious</option>
              <option value="irritable">Irritable</option>
              <option value="depressed">Depressed</option>
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Energy level</span>
            <input
              name="energyLevel"
              type="number"
              min="1"
              max="10"
              step="1"
              value={formData.energyLevel}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Bleeding flow</span>
            <select
              name="bleedingFlow"
              value={formData.bleedingFlow}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="none">None</option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="heavy">Heavy</option>
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Blood clotting</span>
            <select
              name="bloodClotting"
              value={formData.bloodClotting}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Skin condition</span>
            <select
              name="skinCondition"
              value={formData.skinCondition}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="clear">Clear</option>
              <option value="oily">Oily</option>
              <option value="acne">Acne</option>
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Facial hair</span>
            <select
              name="facialHair"
              value={formData.facialHair}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="none">None</option>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Sleep hours</span>
            <input
              name="sleepHours"
              type="number"
              min="0"
              step="0.5"
              value={formData.sleepHours}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Spotting</span>
            <select name="spotting" value={formData.spotting} onChange={handleChange} required style={styles.input}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Notes</span>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Anything notable about today"
              rows={4}
              style={styles.textarea}
            />
          </label>

          <button type="submit" disabled={isSubmitting} style={styles.button}>
            {isSubmitting ? 'Saving...' : 'Save daily log'}
          </button>
        </form>

        {isComplete && <p style={styles.success}>Your daily log was captured.</p>}
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
      'radial-gradient(circle at top, rgba(255, 197, 220, 0.4), transparent 40%), linear-gradient(180deg, #fffafc 0%, #ffffff 100%)',
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
    color: '#231923',
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
    color: '#b14b72',
    fontSize: '0.95rem',
  },
  error: {
    marginTop: '12px',
    color: '#b00020',
    fontSize: '0.95rem',
  },
}