"use client";

import { useRouter } from "next/navigation";
import { MapPin, ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: January 26, 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing and using Google Maps Extractor (&quot;the Service&quot;), you accept and
              agree to be bound by the terms and provisions of this agreement. If you do not agree
              to these terms, please do not use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 mb-4">
              Google Maps Extractor provides a web-based tool that allows users to extract publicly
              available business information from Google Maps. The Service includes features such as
              data extraction, filtering, export capabilities, and extraction history management.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">
              To use our Service, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring the accuracy of information provided during registration</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="text-gray-600 mb-4">
              You must be at least 18 years old to create an account and use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
            <p className="text-gray-600 mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the intellectual property rights of others</li>
              <li>Transmit any harmful or malicious code</li>
              <li>
                Engage in any automated use of the system without our prior written permission
              </li>
              <li>
                Extract data for purposes that violate Google&apos;s Terms of Service or any
                third-party rights
              </li>
              <li>
                Resell or redistribute the extracted data without proper verification of rights
              </li>
              <li>Use the Service to send spam or unsolicited communications</li>
              <li>Attempt to gain unauthorized access to our systems or networks</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Subscription Plans and Payment
            </h2>
            <p className="text-gray-600 mb-4">
              We offer different subscription plans with varying features and quotas:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Free Plan:</strong> Limited extractions per month with basic features
              </li>
              <li>
                <strong>Starter Plan:</strong> Increased quota with additional features
              </li>
              <li>
                <strong>Professional Plan:</strong> Higher limits with API access and priority
                support
              </li>
            </ul>
            <p className="text-gray-600 mb-4">Payment terms:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Subscriptions are billed monthly in advance</li>
              <li>All fees are non-refundable except as required by law</li>
              <li>You can cancel your subscription at any time</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Usage and Rights</h2>
            <p className="text-gray-600 mb-4">
              <strong>Your Data:</strong> You retain all rights to the data you extract using our
              Service. However, you are solely responsible for ensuring your use of the extracted
              data complies with all applicable laws and third-party terms of service.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Our Data:</strong> The Service, including its original content, features, and
              functionality, is owned by Google Maps Extractor and is protected by international
              copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Service Availability and Modifications
            </h2>
            <p className="text-gray-600 mb-4">
              We strive to provide reliable service but cannot guarantee uninterrupted access. We
              reserve the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Modify or discontinue the Service (or any part thereof) at any time</li>
              <li>Impose limits on certain features or restrict access to parts of the Service</li>
              <li>Perform scheduled or emergency maintenance</li>
            </ul>
            <p className="text-gray-600 mb-4">
              We will make reasonable efforts to notify users of significant changes or
              interruptions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-600 mb-4">
              We may terminate or suspend your account and access to the Service immediately,
              without prior notice or liability, for any reason, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Breach of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Extended periods of inactivity</li>
              <li>Non-payment of subscription fees</li>
            </ul>
            <p className="text-gray-600 mb-4">
              Upon termination, your right to use the Service will immediately cease. All provisions
              of the Terms which by their nature should survive termination shall survive.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Disclaimer of Warranties
            </h2>
            <p className="text-gray-600 mb-4">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
              WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>The Service will be uninterrupted, secure, or error-free</li>
              <li>The results obtained from the Service will be accurate or reliable</li>
              <li>Any errors in the Service will be corrected</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Limitation of Liability
            </h2>
            <p className="text-gray-600 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, GOOGLE MAPS EXTRACTOR SHALL NOT BE LIABLE FOR
              ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
              PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA,
              USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
            <p className="text-gray-600 mb-4">
              You agree to indemnify and hold harmless Google Maps Extractor, its officers,
              directors, employees, and agents from any claims, damages, losses, liabilities, and
              expenses (including legal fees) arising out of your use of the Service or violation of
              these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-600 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of India,
              without regard to its conflict of law provisions. Any legal action or proceeding
              arising under these Terms will be brought exclusively in the courts located in India.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify these Terms at any time. If we make material changes,
              we will notify you by email or through a prominent notice on our Service. Your
              continued use of the Service after such modifications constitutes your acceptance of
              the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <ul className="list-none text-gray-600 space-y-2 mb-4">
              <li>By email: legal@googlemapsextractor.com</li>
              <li>
                By visiting our{" "}
                <a href="/contact" className="text-primary-600 hover:text-primary-700 underline">
                  contact page
                </a>
              </li>
            </ul>
          </section>
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
