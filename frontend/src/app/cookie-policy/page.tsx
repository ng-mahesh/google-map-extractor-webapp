"use client";

import { useRouter } from "next/navigation";
import { MapPin, ArrowLeft } from "lucide-react";

export default function CookiePolicyPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: January 26, 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
            <p className="text-gray-600 mb-4">
              Cookies are small text files that are placed on your computer or mobile device when
              you visit a website. They are widely used to make websites work more efficiently and
              provide information to the owners of the site.
            </p>
            <p className="text-gray-600 mb-4">
              Google Maps Extractor uses cookies and similar tracking technologies to track activity
              on our Service and store certain information. This Cookie Policy explains what cookies
              are, how we use them, and your choices regarding cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-600 mb-4">We use cookies for several reasons, including:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>To enable certain functions of the Service</li>
              <li>To provide analytics and understand how you use our Service</li>
              <li>To store your preferences and settings</li>
              <li>To enhance security and prevent fraud</li>
              <li>To remember you when you return to our Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Types of Cookies We Use
            </h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Essential Cookies (Strictly Necessary)
              </h3>
              <p className="text-gray-600 mb-2">
                These cookies are necessary for the Service to function properly. They enable core
                functionality such as security, network management, and accessibility.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-3">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Examples:</strong>
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Authentication cookies (to keep you logged in)</li>
                  <li>Security cookies (to protect against fraud)</li>
                  <li>Session cookies (to remember your preferences during a session)</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Performance Cookies</h3>
              <p className="text-gray-600 mb-2">
                These cookies help us understand how visitors interact with our Service by
                collecting and reporting information anonymously. This helps us improve the way our
                Service works.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-3">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Examples:</strong>
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Analytics cookies (to understand user behavior)</li>
                  <li>Error tracking cookies (to identify and fix issues)</li>
                  <li>Performance monitoring cookies (to measure page load times)</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Functional Cookies</h3>
              <p className="text-gray-600 mb-2">
                These cookies enable the Service to provide enhanced functionality and
                personalization. They may be set by us or by third-party providers whose services we
                have added to our pages.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-3">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Examples:</strong>
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Language preference cookies</li>
                  <li>User interface customization cookies</li>
                  <li>Feature toggle cookies</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Targeting/Advertising Cookies
              </h3>
              <p className="text-gray-600 mb-2">
                These cookies may be set through our site by our advertising partners. They may be
                used to build a profile of your interests and show you relevant ads on other sites.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-3">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Note:</strong> We currently do not use advertising cookies, but may do so
                  in the future with proper notice.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-600 mb-4">
              In addition to our own cookies, we may use various third-party cookies to report usage
              statistics of the Service and deliver content through the Service. These third parties
              have their own privacy policies, which we encourage you to review:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Analytics Services:</strong> We may use services like Google Analytics to
                understand how users interact with our Service
              </li>
              <li>
                <strong>Authentication Services:</strong> For secure login and authentication
              </li>
              <li>
                <strong>Content Delivery Networks:</strong> To deliver content efficiently
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Cookie Choices</h2>
            <p className="text-gray-600 mb-4">
              You have several options to manage or limit how we and our partners use cookies:
            </p>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Browser Settings</h3>
              <p className="text-gray-600 mb-2">
                Most web browsers allow you to control cookies through their settings preferences.
                However, if you limit the ability of websites to set cookies, you may worsen your
                overall user experience, as some features may no longer function properly.
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>
                  <strong>Chrome:</strong> Settings &gt; Privacy and security &gt; Cookies and other
                  site data
                </li>
                <li>
                  <strong>Firefox:</strong> Options &gt; Privacy &amp; Security &gt; Cookies and
                  Site Data
                </li>
                <li>
                  <strong>Safari:</strong> Preferences &gt; Privacy &gt; Cookies and website data
                </li>
                <li>
                  <strong>Edge:</strong> Settings &gt; Cookies and site permissions
                </li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Opt-Out Links</h3>
              <p className="text-gray-600 mb-2">You can opt out of certain third-party cookies:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>
                  Google Analytics:{" "}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    Google Analytics Opt-out Browser Add-on
                  </a>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookie Retention</h2>
            <p className="text-gray-600 mb-4">
              Different cookies are stored for different periods:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Session Cookies:</strong> Deleted when you close your browser
              </li>
              <li>
                <strong>Persistent Cookies:</strong> Remain on your device until they expire or you
                delete them
              </li>
              <li>
                <strong>Authentication Cookies:</strong> Typically last 30 days
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Typically last 1-2 years
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Updates to This Cookie Policy
            </h2>
            <p className="text-gray-600 mb-4">
              We may update our Cookie Policy from time to time to reflect changes in our practices
              or for other operational, legal, or regulatory reasons. We will notify you of any
              material changes by posting the new Cookie Policy on this page with an updated
              &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. More Information</h2>
            <p className="text-gray-600 mb-4">
              For more information about how we process your personal data, please see our{" "}
              <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                Privacy Policy
              </a>
              .
            </p>
            <p className="text-gray-600 mb-4">
              If you have questions about our use of cookies, please contact us:
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
