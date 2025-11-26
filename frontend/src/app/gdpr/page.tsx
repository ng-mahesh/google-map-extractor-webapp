"use client";

import { useRouter } from "next/navigation";
import { MapPin, ArrowLeft, Shield, UserCheck, FileText, Trash2, Download } from "lucide-react";

export default function GDPRPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-4">GDPR Compliance</h1>
        <p className="text-gray-600 mb-8">
          General Data Protection Regulation - Your Rights and Our Commitments
        </p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Our Commitment to GDPR</h2>
            <p className="text-gray-600 mb-4">
              Google Maps Extractor is committed to protecting your privacy and ensuring compliance
              with the General Data Protection Regulation (GDPR). This page outlines how we comply
              with GDPR requirements and explains your rights under this regulation.
            </p>
            <p className="text-gray-600 mb-4">
              The GDPR is a comprehensive data protection law that applies to the processing of
              personal data of individuals in the European Union (EU) and European Economic Area
              (EEA).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Legal Basis for Processing
            </h2>
            <p className="text-gray-600 mb-4">
              We process your personal data based on the following legal grounds:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Consent:</strong> You have given clear consent for us to process your
                personal data for specific purposes (e.g., creating an account, using our services)
              </li>
              <li>
                <strong>Contract:</strong> Processing is necessary for a contract you have with us
                or because you have asked us to take specific steps before entering into a contract
              </li>
              <li>
                <strong>Legal Obligation:</strong> Processing is necessary for us to comply with the
                law
              </li>
              <li>
                <strong>Legitimate Interests:</strong> Processing is necessary for our legitimate
                interests or the legitimate interests of a third party (unless there is a good
                reason to protect your personal data which overrides those legitimate interests)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Your GDPR Rights</h2>
            <p className="text-gray-600 mb-4">
              Under GDPR, you have the following rights regarding your personal data:
            </p>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <UserCheck className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Right to Access (Article 15)
                    </h3>
                    <p className="text-gray-600">
                      You have the right to request a copy of your personal data that we hold. You
                      can access most of your data through your account dashboard. For additional
                      information, contact us at privacy@googlemapsextractor.com.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <FileText className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Right to Rectification (Article 16)
                    </h3>
                    <p className="text-gray-600">
                      You have the right to request that we correct any inaccurate personal data or
                      complete incomplete data. You can update most of your information through your
                      profile settings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <Trash2 className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Right to Erasure (Article 17)
                    </h3>
                    <p className="text-gray-600">
                      Also known as the &quot;right to be forgotten,&quot; you can request that we
                      delete your personal data in certain circumstances. You can delete your
                      account through your profile settings or contact us for assistance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <Shield className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Right to Restriction of Processing (Article 18)
                    </h3>
                    <p className="text-gray-600">
                      You have the right to request that we restrict the processing of your personal
                      data in certain circumstances, such as when you contest the accuracy of the
                      data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <Download className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Right to Data Portability (Article 20)
                    </h3>
                    <p className="text-gray-600">
                      You have the right to receive your personal data in a structured, commonly
                      used, and machine-readable format. You can export your extraction data as CSV
                      files through your dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <Shield className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Right to Object (Article 21)
                    </h3>
                    <p className="text-gray-600">
                      You have the right to object to our processing of your personal data in
                      certain circumstances, such as for direct marketing purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. How to Exercise Your Rights
            </h2>
            <p className="text-gray-600 mb-4">To exercise any of your GDPR rights, you can:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Access your account:</strong> Log in to your account and update your
                settings or profile information
              </li>
              <li>
                <strong>Email us:</strong> Send a request to privacy@googlemapsextractor.com
              </li>
              <li>
                <strong>Contact form:</strong> Use our{" "}
                <a href="/contact" className="text-primary-600 hover:text-primary-700 underline">
                  contact page
                </a>
              </li>
            </ul>
            <p className="text-gray-600 mb-4">
              We will respond to your request within one month. In complex cases, we may extend this
              period by two additional months, and we will inform you if this is necessary.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Data Protection Measures
            </h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate technical and organizational measures to ensure a level of
              security appropriate to the risk, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Encryption:</strong> All data is encrypted in transit using TLS/SSL and at
                rest using industry-standard encryption
              </li>
              <li>
                <strong>Access Controls:</strong> Strict access controls and authentication
                requirements for accessing personal data
              </li>
              <li>
                <strong>Regular Audits:</strong> Regular security audits and vulnerability
                assessments
              </li>
              <li>
                <strong>Data Minimization:</strong> We only collect and process data that is
                necessary for our services
              </li>
              <li>
                <strong>Staff Training:</strong> Regular training for staff on data protection and
                GDPR compliance
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. International Data Transfers
            </h2>
            <p className="text-gray-600 mb-4">
              We primarily store and process data within the European Economic Area (EEA). If we
              transfer personal data outside the EEA, we ensure appropriate safeguards are in place,
              such as:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Standard Contractual Clauses approved by the European Commission</li>
              <li>Adequacy decisions by the European Commission</li>
              <li>Binding Corporate Rules</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Data Breach Notification
            </h2>
            <p className="text-gray-600 mb-4">
              In the event of a personal data breach that is likely to result in a high risk to your
              rights and freedoms, we will notify you without undue delay. We will also notify the
              relevant supervisory authority within 72 hours of becoming aware of the breach, as
              required by GDPR.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Data Protection Officer (DPO)
            </h2>
            <p className="text-gray-600 mb-4">
              We have appointed a Data Protection Officer to oversee our GDPR compliance. You can
              contact our DPO at:
            </p>
            <ul className="list-none text-gray-600 space-y-2 mb-4">
              <li>Email: dpo@googlemapsextractor.com</li>
              <li>Subject line: GDPR Inquiry</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Right to Lodge a Complaint
            </h2>
            <p className="text-gray-600 mb-4">
              If you believe we have not handled your personal data in accordance with GDPR, you
              have the right to lodge a complaint with a supervisory authority. In the EU, you can
              contact your local data protection authority. You can find a list of supervisory
              authorities at{" "}
              <a
                href="https://edpb.europa.eu/about-edpb/board/members_en"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                the European Data Protection Board website
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Children&apos;s Privacy
            </h2>
            <p className="text-gray-600 mb-4">
              Our Service is not intended for children under the age of 16. We do not knowingly
              collect personal data from children under 16. If you are a parent or guardian and
              believe your child has provided us with personal data, please contact us so we can
              delete it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Updates to This Policy
            </h2>
            <p className="text-gray-600 mb-4">
              We may update this GDPR compliance page from time to time. We will notify you of any
              material changes by email or through a prominent notice on our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              For any questions about GDPR or to exercise your rights, please contact us:
            </p>
            <ul className="list-none text-gray-600 space-y-2 mb-4">
              <li>Email: privacy@googlemapsextractor.com</li>
              <li>DPO Email: dpo@googlemapsextractor.com</li>
              <li>
                Contact Form:{" "}
                <a href="/contact" className="text-primary-600 hover:text-primary-700 underline">
                  www.googlemapsextractor.com/contact
                </a>
              </li>
            </ul>
            <p className="text-gray-600 mb-4">
              For more information about how we collect and use your data, please see our{" "}
              <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                Privacy Policy
              </a>
              .
            </p>
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
