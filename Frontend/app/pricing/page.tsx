import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionWrapper from "@/components/MotionWrapper";
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
        "Basic resume analysis",
        "Email support",
        "Standard reporting",
        "Mobile app access",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "$299",
      period: "/month",
      description: "Ideal for growing companies",
      icon: Building2,
      color: "from-purple-500 to-purple-600",
      features: [
        "Up to 50 job postings",
        "200 AI interviews per month",
        "Advanced resume analysis",
        "Priority support",
        "Advanced analytics",
        "Custom branding",
        "API access",
        "Team collaboration tools",
      ],
      cta: "Start Free Trial",
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
        "Custom integrations",
        "White-label solution",
        "Advanced security",
        "Custom training",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
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
      name: "Custom Integrations",
      price: "$500",
      description: "One-time setup fee for custom ATS integrations",
      icon: Building2,
    },
    {
      name: "Priority Support",
      price: "$100",
      description: "24/7 phone and chat support",
      icon: Star,
    },
  ];

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
              Simple, Transparent <span className="gradient-text">Pricing</span>
            </MotionWrapper>
            <MotionWrapper
              as="p"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
            >
              Choose the plan that fits your needs. All plans include a 14-day
              free trial.
            </MotionWrapper>
            <MotionWrapper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium"
            >
              <Check className="w-4 h-4 mr-2" />
              No setup fees • Cancel anytime • 14-day free trial
            </MotionWrapper>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <MotionWrapper
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? "ring-2 ring-primary-500 scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center mb-8">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                    >
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-600 ml-2">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      plan.popular
                        ? "bg-primary-600 text-white hover:bg-primary-700 transform hover:scale-105"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Add-ons & Extras
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enhance your plan with additional features and services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {addOns.map((addon, index) => (
              <MotionWrapper
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                  <addon.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {addon.name}
                </h3>
                <div className="text-2xl font-bold text-primary-600 mb-4">
                  {addon.price}
                </div>
                <p className="text-gray-600">{addon.description}</p>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Pricing FAQ
            </h2>
            <p className="text-xl text-gray-600">
              Common questions about our pricing
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Is there a free trial?",
                answer:
                  "Yes! All plans include a 14-day free trial with full access to all features. No credit card required to get started.",
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
                  "The Enterprise plan includes everything in Professional plus custom integrations, dedicated support, advanced security features, and SLA guarantees.",
              },
            ].map((faq, index) => (
              <MotionWrapper
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-6 rounded-2xl hover:shadow-md transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
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
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of companies already using InterviewLytics to
              transform their hiring process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300">
                Contact Sales
              </button>
            </div>
          </MotionWrapper>
        </div>
      </section>

      <Footer />
    </main>
  );
}
