import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionWrapper from "@/components/MotionWrapper";
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
    description:
      "Create job listings with the requirements that drive AI screening and interview questions.",
    details:
      "Describe the role and the skills you need; the platform uses your requirements to match resumes and generate tailored interview questions for every applicant — no extra setup.",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-400/10",
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
    description:
      "Every application is scored against your job requirements the moment it arrives.",
    details:
      "The AI reads each resume, compares it with the job description and requirements, and produces a match percentage with identified strengths and gaps, so you can prioritize the strongest applicants immediately.",
    color: "text-jade-700 dark:text-jade-400",
    bgColor: "bg-jade-100 dark:bg-jade-400/10",
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
    description:
      "Candidates complete two AI interview rounds — a resume deep-dive and a role-fit round.",
    details:
      "Round 1 digs into the candidate's actual experience from their resume; Round 2 focuses on fit for your role. Questions adapt with follow-up chains based on each answer, and candidates can respond by voice or text.",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-400/10",
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
    description:
      "The AI probes inconsistencies and weak spots across a candidate's earlier answers.",
    details:
      "Instead of treating every question in isolation, the interviewer revisits earlier claims and digs deeper where answers were thin — surfacing depth (or gaps) a scripted interview would miss.",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-400/10",
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
    description:
      "Detailed scoring and reports for recruiters, with feedback candidates can actually read.",
    details:
      "Each answer is scored on correctness, clarity, depth and relevance. After both rounds, a final report combines resume match and interview performance into a single weighted verdict with strengths and risks.",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-400/10",
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
    description:
      "See your funnel, score distributions, and per-job performance at a glance.",
    details:
      "The analytics dashboard tracks your hiring funnel from application to hire, average match scores, Round 1 pass rates, and applications per job — so you know where candidates drop off.",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-400/10",
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

export default function Features() {
  return (
    <main className="min-h-screen bg-paper dark:bg-ink">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-jade-50 to-white dark:from-ink dark:to-[#0B1122] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <MotionWrapper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-jade-100 text-jade-800 dark:bg-jade-400/10 dark:text-jade-400 text-sm font-medium mb-6"
            >
              <Shield className="w-4 h-4 mr-2" />
              AI-Powered Features
            </MotionWrapper>

            <MotionWrapper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Powerful Features for{" "}
              <span className="text-jade-700 dark:text-jade-400">Modern Hiring</span>
            </MotionWrapper>

            <MotionWrapper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Discover how our comprehensive suite of AI-powered tools can
              transform your recruitment process and help you find the best
              talent faster.
            </MotionWrapper>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white dark:bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionWrapper
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-jade-100 dark:bg-jade-400/10 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-jade-700 dark:text-jade-400" />
                </div>
                <div className="font-data text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </MotionWrapper>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-gray-50 dark:bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Core Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to streamline your hiring process
            </p>
          </div>

          <div className="space-y-16">
            {features.map((feature, index) => (
              <MotionWrapper
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-12`}
              >
                <div className="flex-1">
                  <div className="flex items-center mb-6">
                    <div
                      className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mr-6`}
                    >
                      <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    {feature.details}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-jade-600 dark:text-jade-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <div
                    className={`w-full h-80 ${feature.bgColor} rounded-2xl flex items-center justify-center dark:border dark:border-line-dark`}
                  >
                    <feature.icon className={`w-32 h-32 ${feature.color}`} />
                  </div>
                </div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-white dark:bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Why Choose InterviewLytics?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Additional benefits that make us the best choice for your hiring
              needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <MotionWrapper
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 dark:bg-[#0B1122] dark:border dark:border-line-dark p-8 rounded-2xl hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-jade-100 dark:bg-jade-400/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-jade-700 dark:text-jade-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 dark:bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See how companies are using our features to transform their hiring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
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
            ].map((testimonial, index) => (
              <MotionWrapper
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-[#0B1122] dark:border dark:border-line-dark p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-accent-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-jade-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-premium">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MotionWrapper
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Create an account today and see how our features can transform
              your hiring process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup-recruiter"
                className="bg-jade-500 text-ink px-8 py-4 rounded-lg text-lg font-semibold hover:bg-jade-400 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Get Started as a Recruiter
              </Link>
              <Link
                href="/signup-candidate"
                className="border-2 border-jade-400 text-jade-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-jade-400 hover:text-ink transition-all duration-300 flex items-center justify-center"
              >
                Sign Up as a Candidate
              </Link>
            </div>
          </MotionWrapper>
        </div>
      </section>

      <Footer />
    </main>
  );
}
