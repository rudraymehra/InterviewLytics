import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'
import InterviewSimulation from '@/components/landing/InterviewSimulation'
import { Grain } from '@/components/landing/Ambience'

export default function Home() {
  return (
    <main className="relative min-h-screen bg-paper dark:bg-ink transition-colors duration-300">
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
