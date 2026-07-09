import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionWrapper from "@/components/MotionWrapper";
import { Grain, Orb } from "@/components/landing/Ambience";
import Reveal from "@/components/landing/Reveal";
import TiltCard from "@/components/landing/TiltCard";
import { Check, Star, Zap, Building2, Users, Crown } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Perfect for small teams getting started",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      features: [
        "Up to 10 job postings",
        "50 AI interviews per month",
        "AI resume screening",
        "Email support",
        "Hiring reports",
        "Candidate feedback",
      ],
      cta: "Get Started",
      href: "/signup-recruiter",
      popular: false,
    },
    {
      name: "Professional",
      price: "$299",
      period: "/month",
      description: "Ideal for growing companies",
      icon: Building2,
      color: "from-jade-500 to-jade-600",
      features: [
        "Up to 50 job postings",
        "200 AI interviews per month",
        "Two-round adaptive interviews",
        "Cross-question probing",
        "Analytics dashboard",
        "Weighted final reports",
        "Priority support",
      ],
      cta: "Get Started",
      href: "/signup-recruiter",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with complex needs",
      icon: Crown,
      color: "from-orange-500 to-orange-600",
      features: [
        "Unlimited job postings",
        "Unlimited AI interviews",
        "AI-powered insights",
        "Dedicated support manager",
        "Custom training",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      href: "/contact",
      popular: false,
    },
  ];

  const addOns = [
    {
      name: "Additional Interviews",
      price: "$2",
      description: "Per AI interview beyond your plan limit",
      icon: Zap,
    },
    {
      name: "Guided Onboarding",
      price: "$500",
      description: "One-time hands-on setup and training for your team",
      icon: Building2,
    },
    {
      name: "Priority Support",
      price: "$100",
      description: "Faster response times from our support team",
      icon: Star,
    },
  ];

  return (
    <main className="min-h-screen bg-paper dark:bg-ink">
      <Navbar />
      <Grain />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-jade-50 to-white dark:from-ink dark:to-[#0B1122] py-20">
        <Orb className="h-[520px] w-[520px] -top-48 -left-48 !opacity-[0.08]" />
        <Orb magenta className="h-[480px] w-[480px] -bottom-48 -right-40 !opacity-[0.08]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <MotionWrapper
              as="h1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Simple, Transparent <span className="text-jade-700 dark:text-jade-400">Pricing</span>
            </MotionWrapper>
            <MotionWrapper
              as="p"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8"
            >
              Choose the plan that fits your needs. Create an account and
              explore the platform before you commit.
            </MotionWrapper>
            <MotionWrapper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 dark:bg-jade-400/10 dark:text-jade-400 text-sm font-medium"
            >
              <Check className="w-4 h-4 mr-2" />
              No setup fees • Cancel anytime
            </MotionWrapper>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-white dark:bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <MotionWrapper
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative ${plan.popular ? "scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-jade-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                <TiltCard
                  className={`scanline-hover h-full bg-white dark:bg-[#0B1122] dark:border dark:border-line-dark rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                    plan.popular ? "ring-2 ring-jade-500" : ""
                  }`}
                >
                <div className="p-8">
                  <div className="text-center mb-8">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                    >
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="font-data text-5xl font-bold text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-2">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-jade-600 dark:text-jade-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`block w-full py-4 px-6 rounded-lg font-semibold text-center transition-all duration-300 ${
                      plan.popular
                        ? "bg-jade-600 text-white hover:bg-jade-700 dark:bg-jade-500 dark:text-ink dark:hover:bg-jade-400 transform hover:scale-105"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
                </TiltCard>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 bg-gray-50 dark:bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Add-ons & Extras
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Enhance your plan with additional features and services
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {addOns.map((addon, index) => (
              <MotionWrapper
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <TiltCard className="scanline-hover h-full bg-white dark:bg-[#0B1122] dark:border dark:border-line-dark p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-jade-100 dark:bg-jade-400/10 rounded-lg flex items-center justify-center mb-6">
                    <addon.icon className="w-6 h-6 text-jade-700 dark:text-jade-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {addon.name}
                  </h3>
                  <div className="font-data text-2xl font-bold text-jade-700 dark:text-jade-400 mb-4">
                    {addon.price}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{addon.description}</p>
                </TiltCard>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-ink">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Pricing FAQ
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Common questions about our pricing
            </p>
          </Reveal>

          <div className="space-y-6">
            {[
              {
                question: "Can I try the platform before paying?",
                answer:
                  "Yes! You can create a recruiter account for free, post a job, and see AI resume screening and interviews in action before choosing a plan.",
              },
              {
                question: "Can I change plans anytime?",
                answer:
                  "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.",
              },
              {
                question: "What happens if I exceed my plan limits?",
                answer:
                  "We'll notify you when you're approaching your limits. You can either upgrade your plan or purchase additional capacity as add-ons.",
              },
              {
                question: "Do you offer discounts for annual billing?",
                answer:
                  "Yes! Save up to 20% when you pay annually. Contact our sales team for custom enterprise pricing and volume discounts.",
              },
              {
                question: "What's included in the Enterprise plan?",
                answer:
                  "The Enterprise plan includes everything in Professional plus unlimited usage, a dedicated support manager, custom training, and SLA guarantees.",
              },
            ].map((faq, index) => (
              <MotionWrapper
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 dark:bg-[#0B1122] dark:border dark:border-line-dark p-6 rounded-2xl hover:shadow-md transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-premium">
        <Orb magenta className="h-[480px] w-[480px] -bottom-48 -right-40 !opacity-[0.08]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MotionWrapper
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join companies already using InterviewLytics to transform their
              hiring process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup-recruiter"
                className="bg-jade-500 text-ink px-8 py-4 rounded-lg text-lg font-semibold hover:bg-jade-400 transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </Link>
              <Link
                href="/contact"
                className="border-2 border-jade-400 text-jade-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-jade-400 hover:text-ink transition-all duration-300"
              >
                Contact Sales
              </Link>
            </div>
          </MotionWrapper>
        </div>
      </section>

      <Footer />
    </main>
  );
}
