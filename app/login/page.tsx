"use client"

import Link from 'next/link'
import { Building2, User } from 'lucide-react'

export default function Login() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#060915] via-[#0c1530] to-[#1a2a4f] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-[0_18px_60px_rgba(3,15,35,0.45)] px-8 py-10 text-center text-slate-100">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300">INTERVIEWLYTICS</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Choose your portal</h1>
          <p className="mt-3 text-sm text-slate-300">
            Sign in as a recruiter or candidate to access your tailored dashboard.
          </p>

          <div className="mt-10 space-y-4">
            <Link
              href="/login-recruiter"
              className="group flex items-center justify-between rounded-2xl border border-white/20 bg-white/90 px-6 py-5 text-left shadow-[0_12px_35px_rgba(12,24,62,0.35)] transition-all hover:-translate-y-1 hover:border-white/40 hover:bg-white"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c5cff] via-[#8f5dff] to-[#46d9ff] text-white shadow-[0_10px_25px_rgba(124,92,255,0.45)]">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Login as Recruiter</h2>
                  <p className="text-sm text-slate-600">Post jobs, manage interviews, and review analytics.</p>
                </div>
              </div>
            </Link>

            <Link
              href="/login-candidate"
              className="group flex items-center justify-between rounded-2xl border border-white/15 bg-white/80 px-6 py-5 text-left shadow-[0_10px_30px_rgba(22,35,74,0.35)] transition-all hover:-translate-y-1 hover:border-white/35 hover:bg-white"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff5d9e] via-[#ff7bb2] to-[#ffb86c] text-white shadow-[0_10px_25px_rgba(255,123,178,0.45)]">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Login as Candidate</h2>
                  <p className="text-sm text-slate-600">Track applications and ace AI-powered interviews.</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-12 grid gap-2 text-sm text-slate-200">
            <p>
              Don't have an account?{' '}
              <Link href="/signup-recruiter" className="font-semibold text-white hover:underline">
                Register as Recruiter
              </Link>
            </p>
            <p>
              Candidates can{' '}
              <Link href="/signup-candidate" className="font-semibold text-white hover:underline">
                create an account here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
