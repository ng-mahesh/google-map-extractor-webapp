"use client";

import { useRouter } from "next/navigation";
import { MapPin, ChevronDown, Search } from "lucide-react";
import { useState } from "react";

export default function FAQPage() {
  const router = useRouter();
  const [openItems, setOpenItems] = useState<number[]>([0]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const faqs = [
    {
      category: "General",
      questions: [
        {
          question: "What is Google Maps Extractor?",
          answer:
            "Google Maps Extractor is a web-based tool that allows you to extract publicly available business information from Google Maps, including business names, addresses, phone numbers, emails, websites, ratings, and reviews. It's designed to help sales teams, marketers, researchers, and businesses gather valuable data efficiently.",
        },
        {
          question: "Is Google Maps Extractor free to use?",
          answer:
            "We offer a free plan with 10 extractions per month and 10 results per extraction. For higher limits and advanced features, we offer paid plans starting at ₹499/month. You can upgrade anytime to access more extractions, higher result limits, and additional features like API access.",
        },
        {
          question: "How does the extraction process work?",
          answer:
            "Simply enter a search keyword (like 'restaurants in New York'), configure your preferences (max results, filters), and start the extraction. Our system will process your request in real-time, and you can watch the progress live. Once complete, you can view, filter, and export the results as a CSV file.",
        },
        {
          question: "What information can I extract?",
          answer:
            "You can extract: business name, address, phone number, email, website URL, rating, total reviews, place ID, types/categories, and Google Maps URL. The availability of specific fields depends on what information is publicly available for each business.",
        },
      ],
    },
    {
      category: "Features & Functionality",
      questions: [
        {
          question: "Can I filter results during extraction?",
          answer:
            "Yes! Our advanced filtering options allow you to: filter by contact availability (phone/email), filter by website presence, sort by rating (highest/lowest first), and skip duplicate places automatically. These filters help you get only the most relevant data.",
        },
        {
          question: "What formats can I export data to?",
          answer:
            "Currently, we support CSV (Comma-Separated Values) export format. CSV files can be easily imported into Excel, Google Sheets, CRM systems, email marketing tools, and most data analysis software.",
        },
        {
          question: "Can I access my previous extractions?",
          answer:
            "Yes! All your extractions are saved in your history. The retention period depends on your plan: Free plan (7 days), Starter plan (30 days), and Professional plan (90 days). You can view, filter, and re-export your historical data anytime within this period.",
        },
        {
          question: "Does the Professional plan include API access?",
          answer:
            "Yes! The Professional plan includes API access, allowing you to integrate Google Maps Extractor functionality directly into your own applications and workflows. Documentation and API keys are provided upon subscription.",
        },
      ],
    },
    {
      category: "Pricing & Plans",
      questions: [
        {
          question: "What are the differences between plans?",
          answer:
            "Free Plan: 10 extractions/month, 10 results per extraction, 7-day history, CSV export. Starter Plan (₹499/month): 100 extractions/month, 50 results per extraction, 30-day history, advanced filters, email support. Professional Plan (₹1,499/month): 500 extractions/month, 100 results per extraction, 90-day history, API access, priority support.",
        },
        {
          question: "Can I upgrade or downgrade my plan?",
          answer:
            "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to the new features. When downgrading, the change will take effect at the end of your current billing cycle.",
        },
        {
          question: "Do you offer refunds?",
          answer:
            "All fees are non-refundable except as required by law. However, you can cancel your subscription at any time, and you'll retain access until the end of your current billing period.",
        },
        {
          question: "Is there a limit to how many results I can extract?",
          answer:
            "Yes, limits depend on your plan. Free users can extract up to 10 results per extraction, Starter users up to 50, and Professional users up to 100. Monthly extraction quotas also apply: Free (10), Starter (100), Professional (500).",
        },
      ],
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          question: "Is my data secure?",
          answer:
            "Absolutely. We use industry-standard encryption for data in transit (TLS/SSL) and at rest. We implement strict access controls, regular security audits, and comply with GDPR and other data protection regulations. Your extracted data is never shared with third parties.",
        },
        {
          question: "Are you GDPR compliant?",
          answer:
            "Yes, we are fully GDPR compliant. We respect your privacy rights, implement appropriate security measures, and provide you with full control over your data. You can access, modify, or delete your data at any time. Visit our GDPR page for more details.",
        },
        {
          question: "What happens to my data if I cancel my subscription?",
          answer:
            "If you cancel your subscription, you'll retain access to your account and data until the end of your billing period. After cancellation, your extraction history will be retained according to your last plan's retention period, after which it will be automatically deleted.",
        },
        {
          question: "Do you use cookies?",
          answer:
            "Yes, we use essential cookies for authentication and session management, performance cookies to improve our service, and functional cookies to remember your preferences. You can manage cookie preferences in your browser settings. See our Cookie Policy for details.",
        },
      ],
    },
    {
      category: "Technical Questions",
      questions: [
        {
          question: "What browsers are supported?",
          answer:
            "Google Maps Extractor works on all modern web browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser for the best experience.",
        },
        {
          question: "Can I run multiple extractions simultaneously?",
          answer:
            "Currently, you can run one extraction at a time. If you need to run multiple extractions, you can queue them by starting a new extraction after the previous one completes. Professional users with API access can implement parallel extractions programmatically.",
        },
        {
          question: "Why did my extraction fail or return fewer results?",
          answer:
            "Extractions may return fewer results than expected due to: limited availability of public data for your search query, filters you've applied (contact/website filtering), Google Maps having fewer businesses matching your criteria, or rate limiting. Try adjusting your search query or filters.",
        },
        {
          question: "How accurate is the extracted data?",
          answer:
            "We extract publicly available data directly from Google Maps. The accuracy depends on the information businesses have provided to Google. We recommend verifying critical information before use, especially for outreach campaigns.",
        },
      ],
    },
    {
      category: "Legal & Compliance",
      questions: [
        {
          question: "Is it legal to extract data from Google Maps?",
          answer:
            "Our service extracts only publicly available information. However, you are responsible for ensuring your use of the extracted data complies with all applicable laws, regulations, and Google's Terms of Service. We recommend consulting with legal counsel if you have specific concerns.",
        },
        {
          question: "Can I use the data for commercial purposes?",
          answer:
            "You retain all rights to the data you extract. However, you must ensure your use complies with applicable laws, including data protection regulations, anti-spam laws, and privacy rights. We recommend obtaining proper consent before contacting businesses.",
        },
        {
          question: "What are your Terms of Service?",
          answer:
            "Our Terms of Service outline the rules and regulations for using our service. Key points include acceptable use policies, payment terms, data usage rights, and liability limitations. Please review our Terms of Service page for complete details.",
        },
      ],
    },
    {
      category: "Support",
      questions: [
        {
          question: "How can I get support?",
          answer:
            "We offer multiple support channels: email support (support@googlemapsextractor.com), our Contact page, and comprehensive documentation. Response times vary by plan: Free (48 business hours), Starter (24 business hours), Professional (4 business hours priority support).",
        },
        {
          question: "Do you offer training or documentation?",
          answer:
            "Yes! We provide comprehensive documentation, video tutorials, and step-by-step guides to help you get the most out of Google Maps Extractor. Professional plan users can request personalized onboarding sessions.",
        },
        {
          question: "What if I encounter a bug or technical issue?",
          answer:
            "Please report any bugs or technical issues to support@googlemapsextractor.com. Include details about what you were doing when the issue occurred, any error messages, and your browser/device information. We'll investigate and respond as quickly as possible.",
        },
      ],
    },
  ];

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Google Maps Extractor</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/")}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Home
              </button>
              <button
                onClick={() => router.push("/login")}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Login
              </button>
              <button onClick={() => router.push("/register")} className="btn-primary">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Find answers to common questions about Google Maps Extractor
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredFaqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.category}</h2>
              <div className="space-y-3">
                {category.questions.map((faq, faqIndex) => {
                  const globalIndex =
                    faqs
                      .slice(0, categoryIndex)
                      .reduce((acc, cat) => acc + cat.questions.length, 0) + faqIndex;
                  const isOpen = openItems.includes(globalIndex);

                  return (
                    <div
                      key={faqIndex}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 transition-colors"
                    >
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg font-medium text-gray-900 pr-8">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-primary-600 flex-shrink-0 transition-transform ${
                            isOpen ? "transform rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {searchQuery && filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No results found for &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Still have questions? */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Still have questions?</h3>
          <p className="text-primary-100 mb-6">
            Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
          </p>
          <button
            onClick={() => router.push("/contact")}
            className="bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg inline-flex items-center space-x-2"
          >
            <span>Contact Support</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-6 h-6 text-primary-500" />
                <span className="text-white font-bold">Google Maps Extractor</span>
              </div>
              <p className="text-sm">
                Extract business data from Google Maps efficiently and securely.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/#features" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/#pricing" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/faq" className="hover:text-white">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/about" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/cookie-policy" className="hover:text-white">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="/gdpr" className="hover:text-white">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Google Maps Extractor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
