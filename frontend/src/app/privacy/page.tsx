"use client";

import { useRouter } from "next/navigation";
import { MapPin, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: January 26, 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Welcome to Google Maps Extractor. We respect your privacy and are committed to
              protecting your personal data. This privacy policy will inform you about how we look
              after your personal data when you visit our website and use our services, and tell you
              about your privacy rights and how the law protects you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              We collect and process the following data about you:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Identity Data:</strong> Name, username, email address
              </li>
              <li>
                <strong>Technical Data:</strong> IP address, browser type and version, time zone
                setting, browser plug-in types and versions, operating system and platform
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you use our website and services,
                including extraction history and search queries
              </li>
              <li>
                <strong>Profile Data:</strong> Your username and password, extraction preferences,
                feedback and survey responses
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Data</h2>
            <p className="text-gray-600 mb-4">
              We will only use your personal data when the law allows us to. Most commonly, we will
              use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent and address technical issues</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We have put in place appropriate security measures to prevent your personal data from
              being accidentally lost, used or accessed in an unauthorized way, altered or
              disclosed. We use industry-standard encryption methods to protect your data both in
              transit and at rest.
            </p>
            <p className="text-gray-600 mb-4">
              All extraction data you collect is encrypted and stored securely. We never share your
              extracted data with third parties without your explicit consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Retention</h2>
            <p className="text-gray-600 mb-4">
              We will only retain your personal data for as long as necessary to fulfill the
              purposes we collected it for, including for the purposes of satisfying any legal,
              accounting, or reporting requirements.
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Free Plan:</strong> Extraction history is retained for 7 days
              </li>
              <li>
                <strong>Starter Plan:</strong> Extraction history is retained for 30 days
              </li>
              <li>
                <strong>Professional Plan:</strong> Extraction history is retained for 90 days
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Legal Rights</h2>
            <p className="text-gray-600 mb-4">
              Under certain circumstances, you have rights under data protection laws in relation to
              your personal data:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Right to access:</strong> You can request access to your personal data
              </li>
              <li>
                <strong>Right to rectification:</strong> You can request correction of inaccurate
                data
              </li>
              <li>
                <strong>Right to erasure:</strong> You can request deletion of your personal data
              </li>
              <li>
                <strong>Right to restrict processing:</strong> You can request restriction of
                processing your data
              </li>
              <li>
                <strong>Right to data portability:</strong> You can request transfer of your data
              </li>
              <li>
                <strong>Right to object:</strong> You can object to processing of your data
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Third-Party Services</h2>
            <p className="text-gray-600 mb-4">
              We may use third-party services to help us operate our business and deliver services
              to you. These third parties have access to your personal data only to perform specific
              tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies</h2>
            <p className="text-gray-600 mb-4">
              We use cookies and similar tracking technologies to track activity on our service and
              hold certain information. You can instruct your browser to refuse all cookies or to
              indicate when a cookie is being sent. For more information, please see our{" "}
              <a
                href="/cookie-policy"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Cookie Policy
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-600 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &quot;Last
              updated&quot; date. You are advised to review this Privacy Policy periodically for any
              changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-none text-gray-600 space-y-2 mb-4">
              <li>By email: privacy@googlemapsextractor.com</li>
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
