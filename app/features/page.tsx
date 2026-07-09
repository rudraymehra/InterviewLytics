import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionWrapper from "@/components/MotionWrapper";
import { Grain, Orb } from "@/components/landing/Ambience";
import Reveal from "@/components/landing/Reveal";
import TiltCard from "@/components/landing/TiltCard";
import {
  FileText,
  Brain,
  MessageCircle,
  BarChart3,
  Target,
  Zap,
  GitBranch,
  Mic,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Job Posting",
    tag: "JOB INTAKE",
    description:
      "Create job listings with the requirements that drive AI screening and interview questions.",
    details:
      "Describe the role and the skills you need; the platform uses your requirements to match resumes and generate tailored interview questions for every applicant — no extra setup.",
    accent: "text-jade-400",
    accentBg: "bg-jade-400/10",
    accentBorder: "border-jade-400/20",
    accentDot: "bg-jade-400",
    accentBar: "bg-jade-400/60",
    benefits: [
      "Requirement-driven screening",
      "Configurable pass threshold",
      "Draft and publish flow",
      "Applicant tracking per job",
    ],
  },
  {
    icon: Brain,
    title: "AI Resume Screening",
    tag: "SILENT SCORING",
    description:
      "Every application is scored against your job requirements the moment it arrives.",
    details:
      "The AI reads each resume, compares it with the job description and requirements, and produces a match percentage with identified strengths and gaps, so you can prioritize the strongest applicants immediately.",
    accent: "text-neon-spring",
    accentBg: "bg-neon-spring/10",
    accentBorder: "border-neon-spring/20",
    accentDot: "bg-neon-spring",
    accentBar: "bg-neon-spring/60",
    benefits: [
      "Match percentage per applicant",
      "Skill extraction",
      "Strengths and gaps summary",
      "Instant results",
    ],
  },
  {
    icon: MessageCircle,
    title: "Two-Round Adaptive Interviews",
    tag: "RESUME DEEP-DIVE",
    description:
      "Candidates complete two AI interview rounds — a resume deep-dive and a role-fit round.",
    details:
      "Round 1 digs into the candidate's actual experience from their resume; Round 2 focuses on fit for your role. Questions adapt with follow-up chains based on each answer, and candidates can respond by voice or text.",
    accent: "text-jade-400",
    accentBg: "bg-jade-400/10",
    accentBorder: "border-jade-400/20",
    accentDot: "bg-jade-400",
    accentBar: "bg-jade-400/60",
    benefits: [
      "Adaptive follow-ups",
      "Voice or typed answers",
      "Automatic round advancement",
      "Available around the clock",
    ],
  },
  {
    icon: GitBranch,
    title: "Cross-Question Probing",
    tag: "CROSS-EXAMINATION",
    description:
      "The AI probes inconsistencies and weak spots across a candidate's earlier answers.",
    details:
      "Instead of treating every question in isolation, the interviewer revisits earlier claims and digs deeper where answers were thin — surfacing depth (or gaps) a scripted interview would miss.",
    accent: "text-neon-magenta",
    accentBg: "bg-neon-magenta/10",
    accentBorder: "border-neon-magenta/20",
    accentDot: "bg-neon-magenta",
    accentBar: "bg-neon-magenta/60",
    benefits: [
      "Follow-up chains",
      "Consistency checks",
      "Depth assessment",
      "Per-answer evaluation",
    ],
  },
  {
    icon: BarChart3,
    title: "Hiring Reports & Feedback",
    tag: "FINAL VERDICT",
    description:
      "Detailed scoring and reports for recruiters, with feedback candidates can actually read.",
    details:
      "Each answer is scored on correctness, clarity, depth and relevance. After both rounds, a final report combines resume match and interview performance into a single weighted verdict with strengths and risks.",
    accent: "text-neon-spring",
    accentBg: "bg-neon-spring/10",
    accentBorder: "border-neon-spring/20",
    accentDot: "bg-neon-spring",
    accentBar: "bg-neon-spring/60",
    benefits: [
      "Per-question scoring",
      "Round summaries",
      "Weighted final verdict",
      "Candidate-facing feedback",
    ],
  },
  {
    icon: Target,
    title: "Pipeline Analytics",
    tag: "WIRE SIGNAL",
    description:
      "See your funnel, score distributions, and per-job performance at a glance.",
    details:
      "The analytics dashboard tracks your hiring funnel from application to hire, average match scores, Round 1 pass rates, and applications per job — so you know where candidates drop off.",
    accent: "text-jade-400",
    accentBg: "bg-jade-400/10",
    accentBorder: "border-jade-400/20",
    accentDot: "bg-jade-400",
    accentBar: "bg-jade-400/60",
    benefits: [
      "Hiring funnel view",
      "Score distribution",
      "Round 1 pass rate",
      "Applications per job",
    ],
  },
];

const additionalFeatures = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Applications are screened in seconds and interviews start the moment a candidate is ready.",
  },
  {
    icon: Mic,
    title: "Voice Interviews",
    description:
      "Candidates answer by speaking naturally — the AI reads questions aloud and transcribes responses.",
  },
  {
    icon: Shield,
    title: "Consistent Evaluation",
    description:
      "Every candidate is assessed against the same rubric, reducing interviewer-to-interviewer variance.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description:
      "AI interviews available around the clock for global candidates.",
  },
  {
    icon: TrendingUp,
    title: "Score-Driven Decisions",
    description:
      "Match percentages, round scores and a weighted final grade put numbers behind every decision.",
  },
  {
    icon: CheckCircle,
    title: "Built-In Candidate Portal",
    description:
      "Candidates browse your openings, apply with one upload, and track their progress in one place.",
  },
];

const stats = [
  { icon: Zap, value: "Instant", label: "Resume Screening" },
  { icon: MessageCircle, value: "2", label: "Adaptive Interview Rounds" },
  { icon: TrendingUp, value: "4", label: "Scoring Dimensions" },
  { icon: Clock, value: "24/7", label: "AI Available" },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "HR Director",
    company: "TechCorp",
    content:
      "The AI interview feature has been a game-changer. We can now assess candidates 24/7 and get detailed insights instantly.",
    rating: 5,
  },
  {
    name: "David Rodriguez",
    role: "Talent Acquisition Manager",
    company: "InnovateX",
    content:
      "The resume analysis is incredibly accurate. It saves us hours of manual screening and helps us find hidden gems.",
    rating: 5,
  },
  {
    name: "Emily Chen",
    role: "Head of People",
    company: "StartupXYZ",
    content:
      "The analytics dashboard gives us insights we never had before. We can now make data-driven hiring decisions.",
    rating: 5,
  },
];

export default function Features() {
  return (
    <main className="min-h-screen bg-ink">
      <Navbar />
      <Grain />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ink to-[#0B1122] py-24">
        <Orb className="h-[520px] w-[520px] -top-48 -left-48 !opacity-[0.08]" />
        <Orb magenta className="h-[480px] w-[480px] -bottom-48 -right-40 !opacity-[0.08]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <MotionWrapper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="eyebrow inline-flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                AI-Powered Features
              </span>
            </MotionWrapper>

            <MotionWrapper
              as="h1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Powerful Features for{" "}
              <span className="text-jade-400">Modern Hiring</span>
            </MotionWrapper>

            <MotionWrapper
              as="p"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Discover how our comprehensive suite of AI-powered tools can
              transform your recruitment process and help you find the best
              talent faster.
            </MotionWrapper>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <Reveal key={index} index={index}>
                <div className="hud-panel bg-[#0B1122] border border-line-dark rounded-xl px-6 py-8 text-center transition-colors duration-300 hover:border-jade-400/30">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-jade-400/10 border border-jade-400/20 mb-4">
                    <stat.icon className="w-6 h-6 text-jade-400" aria-hidden="true" />
                  </div>
                  <div className="font-data text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-20">
            <p className="eyebrow mb-4">The Toolkit</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Core Features
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to streamline your hiring process
            </p>
          </Reveal>

          <div className="space-y-24">
            {features.map((feature, index) => (
              <Reveal
                key={index}
                className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-12 lg:gap-16`}
              >
                <div className="flex-1">
                  <div className="flex items-start gap-5 mb-6">
                    <div
                      className={`w-14 h-14 shrink-0 ${feature.accentBg} border ${feature.accentBorder} rounded-xl flex items-center justify-center`}
                    >
                      <feature.icon className={`w-7 h-7 ${feature.accent}`} aria-hidden="true" />
                    </div>
                    <div>
                      <p className={`font-data text-[11px] tracking-[0.2em] uppercase ${feature.accent} mb-1.5`}>
                        {`${String(index + 1).padStart(2, "0")} // ${feature.tag}`}
                      </p>
                      <h3 className="font-display text-2xl font-bold text-white">
                        {feature.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-lg text-gray-300 mb-4">
                    {feature.description}
                  </p>

                  <p className="text-gray-400 mb-8 leading-relaxed">
                    {feature.details}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-jade-400 mr-3 flex-shrink-0" aria-hidden="true" />
                        <span className="text-sm text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <div className="hud-panel relative w-full h-80 bg-[#0B1122] border border-line-dark rounded-xl overflow-hidden">
                    {/* faint grid texture */}
                    <div
                      className="absolute inset-0 opacity-[0.35]"
                      style={{
                        backgroundImage:
                          "linear-gradient(#1B2A4A 1px, transparent 1px), linear-gradient(90deg, #1B2A4A 1px, transparent 1px)",
                        backgroundSize: "36px 36px",
                      }}
                      aria-hidden="true"
                    />
                    {/* oversized index watermark */}
                    <span
                      className="absolute -bottom-8 right-4 font-data text-[10rem] font-bold leading-none text-white/[0.04] select-none"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {/* header strip */}
                    <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 py-3 border-b border-line-dark bg-ink/40">
                      <span className="font-data text-[10px] tracking-[0.25em] uppercase text-gray-500">
                        MODULE_{String(index + 1).padStart(2, "0")}
                      </span>
                      <span className={`inline-flex items-center gap-2 font-data text-[10px] tracking-[0.2em] uppercase ${feature.accent}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${feature.accentDot}`} aria-hidden="true" />
                        {feature.tag}
                      </span>
                    </div>
                    {/* centered glyph */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                      <div
                        className={`w-24 h-24 ${feature.accentBg} border ${feature.accentBorder} rounded-2xl flex items-center justify-center`}
                      >
                        <feature.icon className={`w-11 h-11 ${feature.accent}`} aria-hidden="true" />
                      </div>
                      <div className="flex items-center gap-1.5" aria-hidden="true">
                        {[28, 44, 20, 52, 36].map((w, i) => (
                          <span
                            key={i}
                            className={`h-1 rounded-full ${i === 3 ? feature.accentBar : "bg-line-dark"}`}
                            style={{ width: `${w}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <p className="eyebrow mb-4">Beyond the Basics</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose InterviewLytics?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Additional benefits that make us the best choice for your hiring
              needs
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Reveal key={index} index={index % 3} className="h-full">
                <TiltCard className="scanline-hover h-full bg-[#0B1122] border border-line-dark p-8 rounded-xl transition-colors duration-300 hover:border-jade-400/30 group">
                  <div className="w-12 h-12 bg-jade-400/10 border border-jade-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-jade-400" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <p className="eyebrow mb-4">Field Reports</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              See how companies are using our features to transform their hiring
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Reveal key={index} index={index} className="h-full">
                <div className="h-full flex flex-col bg-[#0B1122] border border-line-dark p-8 rounded-xl transition-colors duration-300 hover:border-jade-400/30">
                  <div className="flex items-center gap-1 mb-5" aria-label={`${testimonial.rating} out of 5 stars`}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-jade-400 fill-current"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed flex-1">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div className="flex items-center pt-5 border-t border-line-dark">
                    <div className="w-11 h-11 bg-jade-400/10 border border-jade-400/20 rounded-full flex items-center justify-center text-jade-400 font-data font-bold text-sm mr-4">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {testimonial.name}
                      </div>
                      <div className="font-data text-xs text-gray-400 mt-0.5">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24 bg-gradient-premium">
        <Orb magenta className="h-[480px] w-[480px] -bottom-48 -right-40 !opacity-[0.08]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal className="text-white">
            <p className="eyebrow mb-4">Get Started</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience These Features?
            </h2>
            <p className="text-lg md:text-xl mb-10 text-gray-300">
              Create an account today and see how our features can transform
              your hiring process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup-recruiter"
                className="bg-jade-500 text-ink px-8 py-4 rounded-xl text-lg font-semibold hover:bg-jade-400 transition-colors duration-300 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                Get Started as a Recruiter
                <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
              </Link>
              <Link
                href="/signup-candidate"
                className="border border-jade-400/40 text-jade-400 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-jade-400/10 hover:border-jade-400 transition-colors duration-300 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                Sign Up as a Candidate
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
