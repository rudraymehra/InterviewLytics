import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionWrapper from "@/components/MotionWrapper";
import {
  FileText,
  Link,
  Brain,
  MessageCircle,
  BarChart3,
  Target,
  Zap,
  Users,
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
      "Create optimized job listings that automatically generate unique application URLs.",
    details:
      "Our AI analyzes job requirements and automatically optimizes your job postings for better visibility and candidate attraction. Get suggestions for improving job descriptions and requirements.",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    benefits: [
      "Auto-optimization",
      "SEO-friendly",
      "Template library",
      "A/B testing",
    ],
  },
  {
    icon: Link,
    title: "Unique Application Links",
    description:
      "Share custom application URLs for each position to streamline the candidate experience.",
    details:
      "Generate branded, trackable application links that can be shared across multiple platforms. Monitor application sources and optimize your recruitment marketing.",
    color: "text-green-600",
    bgColor: "bg-green-100",
    benefits: [
      "Custom branding",
      "Source tracking",
      "QR codes",
      "Social sharing",
    ],
  },
  {
    icon: Brain,
    title: "Resume Analysis",
    description:
      "Our AI analyzes resumes to identify the most qualified candidates based on skills and experience.",
    details:
      "Advanced NLP and machine learning algorithms extract skills, experience, education, and achievements from resumes. Get detailed matching scores and recommendations.",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    benefits: [
      "95% accuracy",
      "Skill extraction",
      "Experience matching",
      "Bias detection",
    ],
  },
  {
    icon: MessageCircle,
    title: "AI-Powered Interviews",
    description:
      "Automated interview process that adapts questions based on candidate responses and resume.",
    details:
      "Conduct natural, conversational interviews with our advanced AI. Questions adapt based on responses, creating a personalized interview experience for each candidate.",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    benefits: [
      "Adaptive questioning",
      "Natural conversation",
      "Multi-language",
      "Real-time analysis",
    ],
  },
  {
    icon: BarChart3,
    title: "Comprehensive Feedback",
    description:
      "Provide detailed feedback to both recruiters and candidates after the interview process.",
    details:
      "Get detailed insights on candidate performance, communication skills, technical knowledge, and cultural fit. Share constructive feedback with candidates.",
    color: "text-red-600",
    bgColor: "bg-red-100",
    benefits: [
      "Detailed reports",
      "Skill assessment",
      "Cultural fit",
      "Improvement suggestions",
    ],
  },
  {
    icon: Target,
    title: "Data-Driven Insights",
    description:
      "Get actionable insights and analytics to improve your hiring process over time.",
    details:
      "Comprehensive analytics dashboard showing hiring trends, time-to-fill metrics, candidate quality scores, and process optimization recommendations.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    benefits: [
      "Real-time analytics",
      "Trend analysis",
      "Performance metrics",
      "ROI tracking",
    ],
  },
];

const additionalFeatures = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Process applications and conduct interviews in minutes, not days.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Bank-level security with SOC 2 compliance and data encryption.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Collaborate with your team on candidate evaluation and decisions.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description:
      "AI interviews available around the clock for global candidates.",
  },
  {
    icon: TrendingUp,
    title: "Continuous Learning",
    description: "Our AI improves with every interview and feedback cycle.",
  },
  {
    icon: CheckCircle,
    title: "Easy Integration",
    description: "Seamlessly integrate with your existing ATS and HR tools.",
  },
];

const stats = [
  { icon: Zap, value: "40%", label: "Faster Hiring" },
  { icon: Users, value: "10K+", label: "Active Users" },
  { icon: TrendingUp, value: "95%", label: "Success Rate" },
  { icon: Clock, value: "24/7", label: "AI Available" },
];

export default function Features() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <MotionWrapper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-6"
            >
              <Shield className="w-4 h-4 mr-2" />
              AI-Powered Features
            </MotionWrapper>

            <MotionWrapper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Powerful Features for{" "}
              <span className="gradient-text">Modern Hiring</span>
            </MotionWrapper>

            <MotionWrapper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Discover how our comprehensive suite of AI-powered tools can
              transform your recruitment process and help you find the best
              talent faster.
            </MotionWrapper>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </MotionWrapper>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Core Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-lg text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {feature.details}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <div
                    className={`w-full h-80 ${feature.bgColor} rounded-2xl flex items-center justify-center`}
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Choose InterviewLytics?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-accent-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
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
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
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
              Start your free trial today and see how our features can transform
              your hiring process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 mr-2" />
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300">
                View Demo
              </button>
            </div>
          </MotionWrapper>
        </div>
      </section>

      <Footer />
    </main>
  );
}
