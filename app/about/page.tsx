import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionWrapper from "@/components/MotionWrapper";
import { Grain, Orb } from "@/components/landing/Ambience";
import Reveal, { CountUp } from "@/components/landing/Reveal";
import TiltCard from "@/components/landing/TiltCard";
import { Target, Users, Lightbulb, Award } from "lucide-react";

const VALUES = [
  {
    icon: Target,
    title: "Precision",
    description:
      "We focus on accuracy and effectiveness in every feature we build.",
  },
  {
    icon: Users,
    title: "Inclusivity",
    description:
      "We believe in fair, unbiased hiring that gives everyone an equal opportunity.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We constantly push the boundaries of what's possible with AI technology.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "We strive for the highest quality in everything we deliver to our users.",
  },
];

const TEAM = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-Founder",
    bio: "Former Google AI researcher with 10+ years in machine learning and recruitment technology.",
    avatar: "SC",
  },
  {
    name: "Michael Rodriguez",
    role: "CTO & Co-Founder",
    bio: "Ex-Microsoft engineer specializing in scalable AI systems and natural language processing.",
    avatar: "MR",
  },
  {
    name: "Emily Johnson",
    role: "Head of Product",
    bio: "Product leader with experience at LinkedIn and Stripe, focused on user experience and growth.",
    avatar: "EJ",
  },
];

const STATS = [
  { value: 10, suffix: "K+", label: "Active Users" },
  { value: 500, suffix: "+", label: "Companies" },
  { value: 50, suffix: "K+", label: "Interviews Conducted" },
  { value: 95, suffix: "%", label: "Success Rate" },
];

export default function About() {
  return (
    <main className="min-h-screen bg-ink">
      <Navbar />
      <Grain />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <Orb className="h-[520px] w-[520px] -top-48 -left-48 !opacity-[0.1]" />
        <Orb magenta className="h-[480px] w-[480px] -bottom-48 -right-40 !opacity-[0.08]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <MotionWrapper
              as="p"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="eyebrow mb-4"
            >
              {"// Our Story"}
            </MotionWrapper>
            <MotionWrapper
              as="h1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl font-bold text-white mb-6"
            >
              About <span className="neon-text">InterviewLytics</span>
            </MotionWrapper>
            <MotionWrapper
              as="p"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              We&apos;re revolutionizing the hiring process with cutting-edge AI
              technology, making recruitment faster, smarter, and more effective
              for everyone.
            </MotionWrapper>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 border-t border-line-dark/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <p className="eyebrow mb-3">Mission</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
                Our Mission
              </h2>
              <div className="space-y-6">
                <p className="text-lg text-gray-300 leading-relaxed">
                  To transform the hiring landscape by leveraging artificial
                  intelligence to create more efficient, fair, and effective
                  recruitment processes. We believe that the right technology can
                  help companies find the best talent while providing candidates
                  with a seamless, engaging experience.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Our platform eliminates bias, reduces time-to-hire, and ensures
                  that every candidate gets a fair chance to showcase their
                  potential.
                </p>
              </div>
            </Reveal>

            <Reveal index={1}>
              <div className="hud-panel relative overflow-hidden rounded-xl p-8 md:p-10">
                <Orb className="h-[260px] w-[260px] -top-24 -right-24 !opacity-[0.12]" />
                <div className="relative z-10">
                  <p className="eyebrow mb-3">Vision</p>
                  <h3 className="font-display text-2xl font-bold text-white mb-4">
                    Our Vision
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    To become the world&apos;s leading AI-powered recruitment
                    platform, where every hiring decision is data-driven, every
                    candidate experience is exceptional, and every company finds
                    their perfect match.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 border-t border-line-dark/60 bg-[#080D1B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <p className="eyebrow mb-3">Principles</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, index) => (
              <Reveal key={value.title} index={index} className="h-full">
                <TiltCard className="scanline-hover h-full bg-card-dark border border-line-dark rounded-xl p-8 text-center transition-colors duration-300 hover:border-jade-500/40">
                  <div className="w-16 h-16 rounded-2xl bg-jade-400/10 border border-jade-400/20 flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-7 h-7 text-jade-400" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 border-t border-line-dark/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <p className="eyebrow mb-3">Humans Behind the Machine</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              The passionate individuals behind InterviewLytics
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM.map((member, index) => (
              <Reveal key={member.name} index={index} className="h-full">
                <div className="scanline-hover h-full bg-card-dark border border-line-dark rounded-xl p-8 text-center transition-colors duration-300 hover:border-jade-500/40">
                  <div className="w-20 h-20 rounded-full bg-jade-400/10 border border-jade-400/30 flex items-center justify-center mx-auto mb-6">
                    <span className="font-data text-xl font-semibold text-jade-400">
                      {member.avatar}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="font-data text-xs uppercase tracking-[0.14em] text-jade-400/80 mb-4">
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative overflow-hidden py-20 border-t border-line-dark/60 bg-gradient-premium">
        <Orb className="h-[480px] w-[480px] -top-40 -right-40 !opacity-[0.1]" />
        <Orb magenta className="h-[380px] w-[380px] -bottom-40 -left-32 !opacity-[0.06]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <p className="eyebrow mb-3">Telemetry</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Our Impact in Numbers
            </h2>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, index) => (
              <Reveal key={stat.label} index={index}>
                <div className="hud-panel rounded-xl px-4 py-8 text-center">
                  <div className="font-data text-4xl md:text-5xl font-bold text-jade-400 mb-3">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="eyebrow !text-gray-400">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
