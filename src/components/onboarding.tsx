import { useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react'
import { supabase } from '../supabase'

export interface OnboardingData {
  name: string
  dateOfBirth: string
  weightKg: string
}

interface OnboardingProps {
  onComplete?: (data: OnboardingData) => void
}

const initialData: OnboardingData = {
  name: '',
  dateOfBirth: '',
  weightKg: '',
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [formData, setFormData] = useState(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      if (!user?.id) {
        setErrorMessage('You must be signed in before saving your profile.')
        return
      }

      const payload: Record<string, unknown> = {
        id: user.id,
        name: formData.name,
        date_of_birth: formData.dateOfBirth || null,
        weight_kg: formData.weightKg ? Number(formData.weightKg) : null,
      }

      const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' })

      if (error) {
        setErrorMessage(error.message)
      } else {
        onComplete?.(formData)
        setIsComplete(true)
      }
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : String(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card} aria-labelledby="onboarding-title">
        <p style={styles.kicker}>Welcome to Luna</p>
        <h1 id="onboarding-title" style={styles.title}>
          Finish your profile
        </h1>
        <p style={styles.subtitle}>Share a few details so we can personalize your experience.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.field}>
            <span style={styles.label}>Name</span>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your name"
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Date of birth</span>
            <input
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Weight (kg)</span>
            <input
              name="weightKg"
              type="number"
              min="0"
              step="0.1"
              value={formData.weightKg}
              onChange={handleChange}
              required
              placeholder="e.g. 62.5"
              style={styles.input}
            />
          </label>

          <button type="submit" disabled={isSubmitting} style={styles.button}>
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </form>

        {isComplete && <p style={styles.success}>Your profile was saved to Supabase.</p>}
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
  fieldset: {
    border: '1px solid rgba(178, 131, 149, 0.22)',
    borderRadius: '18px',
    padding: '16px',
    margin: 0,
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
  radioGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
    marginTop: '10px',
  },
  radioOption: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#3c2d35',
    fontSize: '0.95rem',
    fontWeight: 500,
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
