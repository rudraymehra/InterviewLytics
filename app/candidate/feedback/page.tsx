'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type FeedbackData = {
  matchScore?: number
  analysisSummary?: string
  extractedSkills?: string[]
  turns?: { question: string; answer?: string; score?: number; notes?: string }[]
}

export default function CandidateFeedbackPage() {
  const search = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<FeedbackData | null>(null)

  useEffect(() => {
    const applicationId = search?.get('applicationId')
    const sessionId = search?.get('sessionId')
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const fetchFeedback = async () => {
      try {
        if (!API_BASE || !token) {
          setError('Login required to view feedback.')
          return
        }

        const result: FeedbackData = {}

        // Pull application analysis if provided
        if (applicationId) {
          const res = await fetch(`${API_BASE}/applications/${applicationId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (res.ok) {
            const json = await res.json()
            const app = json?.data?.application
            result.matchScore = app?.matchScore ?? app?.score
            result.analysisSummary = app?.analysisSummary
            result.extractedSkills = app?.extractedSkills
          }
        }

        // Pull interview session transcript if provided
        if (sessionId) {
          const res2 = await fetch(`${API_BASE}/interview/${sessionId}/next`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (res2.ok) {
            const json2 = await res2.json()
            result.turns = json2?.data?.turns || []
          }
        }

        setData(result)
      } catch (e: any) {
        setError('Failed to load feedback')
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [])

  if (loading) return <div className="p-6">Loading feedback…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Interview Feedback</h1>
        <p className="text-gray-600">A brief summary of your screening and interview.</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Resume Match</h2>
        <div className="rounded border p-4 bg-white">
          <div className="text-sm text-gray-700">Match Score</div>
          <div className="text-3xl font-bold">{data?.matchScore ?? '—'}/100</div>
          {data?.extractedSkills?.length ? (
            <div className="mt-2 text-sm">
              <div className="font-medium">Detected Skills</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {data.extractedSkills.map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">{s}</span>
                ))}
              </div>
            </div>
          ) : null}
          {data?.analysisSummary && (
            <p className="mt-3 text-gray-700 whitespace-pre-wrap">{data.analysisSummary}</p>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Interview Summary</h2>
        <div className="rounded border p-4 bg-white space-y-3">
          {!data?.turns?.length && (
            <p className="text-gray-600">No interview answers captured yet.</p>
          )}
          {data?.turns?.map((t, idx) => (
            <div key={idx} className="border rounded p-3">
              <div className="text-sm text-gray-500">Question</div>
              <div className="font-medium">{t.question}</div>
              {t.answer && (
                <>
                  <div className="mt-2 text-sm text-gray-500">Your Answer</div>
                  <div className="whitespace-pre-wrap text-gray-800">{t.answer}</div>
                </>
              )}
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-600">Score</span>
                <span className="font-semibold">{t.score ?? '—'}/10</span>
              </div>
              {t.notes && <div className="mt-1 text-gray-600">Notes: {t.notes}</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Next Steps</h2>
        <div className="rounded border p-4 bg-white">
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Review questions where the score was below 7 and prepare more specifics.</li>
            <li>Highlight quantifiable impact (metrics, scale, latency, cost) in answers.</li>
            <li>Practice system design trade-offs (consistency, availability, cost).</li>
          </ul>
        </div>
      </section>
    </div>
  )
}