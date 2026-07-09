import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
      unit: "per interview",
      description: "Per AI interview beyond your plan limit",
      icon: Zap,
    },
    {
      name: "Guided Onboarding",
      price: "$500",
      unit: "one-time",
      description: "One-time hands-on setup and training for your team",
      icon: Building2,
    },
    {
      name: "Priority Support",
      price: "$100",
      unit: "/month",
      description: "Faster response times from our support team",
      icon: Star,
    },
  ];

  const faqs = [
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
  ];

  return (
    <main className="min-h-screen bg-ink">
      <Navbar />
      <Grain />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink to-[#0B1122] py-20">
        <Orb className="h-[520px] w-[520px] -top-48 -left-48 !opacity-[0.08]" />
        <Orb magenta className="h-[480px] w-[480px] -bottom-48 -right-40 !opacity-[0.08]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Reveal>
              <p className="eyebrow mb-4">Pricing</p>
            </Reveal>
            <Reveal index={1}>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
                Simple, Transparent <span className="text-jade-400">Pricing</span>
              </h1>
            </Reveal>
            <Reveal index={2}>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Choose the plan that fits your needs. Create an account and
                explore the platform before you commit.
              </p>
            </Reveal>
            <Reveal index={3}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-jade-500/30 bg-jade-400/10 text-jade-400 font-data text-xs uppercase tracking-widest">
                <Check className="w-4 h-4" aria-hidden="true" />
                No setup fees · Cancel anytime
              </span>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, index) => (
              <Reveal key={plan.name} index={index} className="relative h-full">
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-jade-500 text-ink px-4 py-1.5 rounded-full font-data text-[11px] font-semibold uppercase tracking-widest shadow-[0_0_24px_rgba(34,211,238,0.35)]">
                      Most Popular
                    </div>
                  </div>
                )}

                <TiltCard
                  className={`scanline-hover h-full rounded-xl bg-[#0B1122] border transition-all duration-300 ${
                    plan.popular
                      ? "border-jade-500/60 shadow-[0_0_40px_rgba(6,182,212,0.12)]"
                      : "border-line-dark hover:border-jade-500/30"
                  }`}
                >
                  <div className="flex h-full flex-col p-8">
                    <div className="text-center mb-8">
                      <div
                        className={`w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto mb-5 ${
                          plan.popular
                            ? "border-jade-500/40 bg-jade-400/10"
                            : "border-line-dark bg-white/[0.03]"
                        }`}
                      >
                        <plan.icon
                          className={`w-7 h-7 ${plan.popular ? "text-jade-400" : "text-jade-500"}`}
                          aria-hidden="true"
                        />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-white mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-6">{plan.description}</p>
                      <div className="flex items-baseline justify-center">
                        <span className="font-data text-5xl font-bold text-white">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="font-data text-sm text-gray-400 ml-2">
                            {plan.period}
                          </span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <Check
                            className="w-5 h-5 text-jade-400 mr-3 mt-0.5 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={plan.href}
                      className={`mt-auto block w-full py-3.5 px-6 rounded-xl font-semibold text-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink ${
                        plan.popular
                          ? "bg-jade-500 text-ink hover:bg-jade-400"
                          : "border border-line-dark text-white hover:border-jade-500/50 hover:bg-white/[0.04]"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <p className="eyebrow mb-4">Extend Your Plan</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-5">
              Add-ons &amp; Extras
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Enhance your plan with additional features and services
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {addOns.map((addon, index) => (
              <Reveal key={addon.name} index={index} className="h-full">
                <TiltCard className="scanline-hover h-full bg-[#0B1122] border border-line-dark hover:border-jade-500/30 p-8 rounded-xl transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl border border-jade-500/30 bg-jade-400/10 flex items-center justify-center mb-6">
                    <addon.icon className="w-6 h-6 text-jade-400" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white mb-3">
                    {addon.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-data text-2xl font-bold text-jade-400">
                      {addon.price}
                    </span>
                    <span className="font-data text-xs uppercase tracking-widest text-gray-500">
                      {addon.unit}
                    </span>
                  </div>
                  <p className="text-gray-400">{addon.description}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-ink">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <p className="eyebrow mb-4">Answers</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-5">
              Pricing FAQ
            </h2>
            <p className="text-xl text-gray-300">Common questions about our pricing</p>
          </Reveal>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Reveal
                key={faq.question}
                index={Math.min(index, 4)}
                className="bg-[#0B1122] border border-line-dark hover:border-jade-500/30 p-6 rounded-xl transition-colors duration-300"
              >
                <h3 className="font-display text-lg font-semibold text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-premium">
        <Orb magenta className="h-[480px] w-[480px] -bottom-48 -right-40 !opacity-[0.08]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal className="text-white">
            <p className="eyebrow mb-4">Next Step</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              Join companies already using InterviewLytics to transform their
              hiring process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup-recruiter"
                className="bg-jade-500 text-ink px-8 py-4 rounded-xl text-lg font-semibold hover:bg-jade-400 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                Get Started
              </Link>
              <Link
                href="/contact"
                className="border border-jade-400/60 text-jade-400 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-jade-400 hover:text-ink transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                Contact Sales
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
