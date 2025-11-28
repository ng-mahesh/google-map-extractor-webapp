"use client";

import { useRouter } from "next/navigation";
import { MapPin, ArrowLeft, Mail, MessageSquare, Globe, Clock } from "lucide-react";

export default function ContactPage() {
  const router = useRouter();

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions? We&apos;re here to help. Reach out to us through any of the channels
            below.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* General Inquiries */}
          <div className="bg-gradient-to-br from-primary-50 to-white rounded-lg p-8 border border-primary-100 shadow-sm">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">General Inquiries</h3>
            <p className="text-gray-600 mb-4">
              For general questions about our service, features, or pricing
            </p>
            <a
              href="mailto:info@googlemapsextractor.com"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              info@googlemapsextractor.com
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </div>

          {/* Support */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-8 border border-blue-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Technical Support</h3>
            <p className="text-gray-600 mb-4">
              Need help with your account, extractions, or experiencing issues?
            </p>
            <a
              href="mailto:support@googlemapsextractor.com"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
            >
              support@googlemapsextractor.com
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </div>

          {/* Privacy & Legal */}
          <div className="bg-gradient-to-br from-green-50 to-white rounded-lg p-8 border border-green-100 shadow-sm">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy & Legal</h3>
            <p className="text-gray-600 mb-4">
              Questions about privacy, data protection, or legal matters
            </p>
            <a
              href="mailto:privacy@googlemapsextractor.com"
              className="text-green-600 hover:text-green-700 font-medium inline-flex items-center"
            >
              privacy@googlemapsextractor.com
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </div>

          {/* Business & Partnerships */}
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-8 border border-purple-100 shadow-sm">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Business & Partnerships</h3>
            <p className="text-gray-600 mb-4">
              Interested in partnerships, enterprise solutions, or API access?
            </p>
            <a
              href="mailto:business@googlemapsextractor.com"
              className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center"
            >
              business@googlemapsextractor.com
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-gray-50 rounded-lg p-8 mb-12">
          <div className="flex items-start space-x-4">
            <Clock className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Response Time</h3>
              <p className="text-gray-600 mb-4">
                We strive to respond to all inquiries as quickly as possible:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                  <span>
                    <strong>Free Plan:</strong> Within 48 business hours
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                  <span>
                    <strong>Starter Plan:</strong> Within 24 business hours
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                  <span>
                    <strong>Professional Plan:</strong> Priority support within 4 business hours
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="bg-white border-2 border-primary-100 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Before You Contact Us</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Many common questions are answered in our FAQ section. Check it out to get instant
            answers to questions about features, pricing, data extraction, and more.
          </p>
          <button
            onClick={() => router.push("/faq")}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <span>Visit FAQ</span>
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

        {/* Office Information (Optional) */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">
            <strong>Google Maps Extractor</strong>
          </p>
          <p>Dedicated to providing the best data extraction experience</p>
          <p className="mt-4 text-sm">Business Hours: Monday - Friday, 9:00 AM - 6:00 PM IST</p>
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
