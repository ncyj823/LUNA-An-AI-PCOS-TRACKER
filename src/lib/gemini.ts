const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

export async function generatePCOSInsight(logs: unknown[], cycles: unknown[]) {
  const prompt = `
You are a women's health assistant analyzing menstrual and symptom data.
Analyze the following data and provide insights about potential PCOS indicators.

IMPORTANT RULES:
- Never diagnose. Use phrases like "may indicate", "could suggest", "pattern observed"
- Always end with "Please consult a gynecologist for proper medical advice"
- Be empathetic and clear, avoid medical jargon

Cycle Data:
${JSON.stringify(cycles, null, 2)}

Daily Symptom Logs:
${JSON.stringify(logs, null, 2)}

Provide:
1. Key patterns observed
2. Possible explanations (not diagnoses)
3. Lifestyle suggestions
4. When to see a doctor
`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  )

  const data = (await response.json()) as GeminiResponse
  console.log('Gemini response:', JSON.stringify(data, null, 2))
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}
