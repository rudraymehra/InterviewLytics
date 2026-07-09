import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'
import InterviewSimulation from '@/components/landing/InterviewSimulation'
import { Grain } from '@/components/landing/Ambience'

export default function Home() {
  // Dark-only: no flat bg on the wrapper — the body paints void #060913 with
  // the fixed HUD grid + vignette, which must show through between sections.
  return (
    <main className="relative min-h-screen">
      <Grain />
      <Navbar />
      <Hero />
      <InterviewSimulation />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </main>
  )
}
