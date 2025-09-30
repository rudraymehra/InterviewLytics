import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionWrapper from "@/components/MotionWrapper";
import { Target, Users, Lightbulb, Award } from "lucide-react";

export default function About() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <MotionWrapper
              as="h1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              About <span className="gradient-text">InterviewLytics</span>
            </MotionWrapper>
            <MotionWrapper
              as="p"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              We're revolutionizing the hiring process with cutting-edge AI
              technology, making recruitment faster, smarter, and more effective
              for everyone.
            </MotionWrapper>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <MotionWrapper
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To transform the hiring landscape by leveraging artificial
                intelligence to create more efficient, fair, and effective
                recruitment processes. We believe that the right technology can
                help companies find the best talent while providing candidates
                with a seamless, engaging experience.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our platform eliminates bias, reduces time-to-hire, and ensures
                that every candidate gets a fair chance to showcase their
                potential.
              </p>
            </MotionWrapper>

            <MotionWrapper
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary-100 to-secondary-100 p-8 rounded-2xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Vision
              </h3>
              <p className="text-gray-700 leading-relaxed">
                To become the world's leading AI-powered recruitment platform,
                where every hiring decision is data-driven, every candidate
                experience is exceptional, and every company finds their perfect
                match.
              </p>
            </MotionWrapper>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
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
            ].map((value, index) => (
              <MotionWrapper
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind InterviewLytics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
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
            ].map((member, index) => (
              <MotionWrapper
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
                  {member.avatar}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 leading-relaxed">{member.bio}</p>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-16">
              Our Impact in Numbers
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "10,000+", label: "Active Users" },
                { number: "500+", label: "Companies" },
                { number: "50,000+", label: "Interviews Conducted" },
                { number: "95%", label: "Success Rate" },
              ].map((stat, index) => (
                <MotionWrapper
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    {stat.number}
                  </div>
                  <div className="text-lg opacity-90">{stat.label}</div>
                </MotionWrapper>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
