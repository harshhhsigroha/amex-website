import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>FirmFlow Ltd ("we", "us", "our") operates the PayCore platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services. We are committed to protecting your personal data and being transparent about how we handle it.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <p className="mb-3">We may collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Personal Information:</strong> Name, email address, phone number, postal address, date of birth, National Insurance number, and bank details when provided for payroll and invoicing purposes.</li>
              <li><strong className="text-foreground">Employment Data:</strong> Employee IDs, timesheets, clock-in/out records, hourly rates, and contractor details necessary for invoice generation and payroll processing.</li>
              <li><strong className="text-foreground">Account Data:</strong> Login credentials, user roles, and authentication tokens.</li>
              <li><strong className="text-foreground">Usage Data:</strong> Pages visited, features used, timestamps, browser type, IP address, and device information.</li>
              <li><strong className="text-foreground">Uploaded Files:</strong> Documents, timesheets, and other files uploaded through the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide, maintain, and improve PayCore services</li>
              <li>To generate invoices, self-billed invoices, and payroll documents</li>
              <li>To process contractor onboarding and manage candidate records</li>
              <li>To facilitate clock-in/out tracking and timesheet management</li>
              <li>To communicate with you about your account or our services</li>
              <li>To comply with legal obligations, including UK tax and employment law</li>
              <li>To detect, prevent, and address technical issues or security threats</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Data Sharing & Disclosure</h2>
            <p>We do not sell your personal data. We may share information with:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong className="text-foreground">Your Employer or Client:</strong> Data necessary for payroll, invoicing, and contractor management as part of the service.</li>
              <li><strong className="text-foreground">Service Providers:</strong> Trusted third parties who assist us in operating the platform (e.g., cloud hosting, payment processing) under strict data protection agreements.</li>
              <li><strong className="text-foreground">Legal Authorities:</strong> When required by law, regulation, or legal process.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Data Retention</h2>
            <p>We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Payroll and invoice records are retained for a minimum of 6 years in accordance with HMRC requirements. You may request deletion of your data where legally permissible.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Data Security</h2>
            <p>We implement appropriate technical and organisational measures to protect your personal data, including encryption in transit and at rest, role-based access controls, and regular security assessments. However, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Your Rights (UK GDPR)</h2>
            <p className="mb-3">Under the UK General Data Protection Regulation, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (right to be forgotten)</li>
              <li>Object to or restrict the processing of your data</li>
              <li>Data portability — receive your data in a structured, machine-readable format</li>
              <li>Withdraw consent at any time where processing is based on consent</li>
              <li>Lodge a complaint with the Information Commissioner's Office (ICO)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Cookies</h2>
            <p>We use essential cookies to ensure the platform functions correctly, and analytics cookies to understand usage patterns.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting a prominent notice on our platform or by emailing you directly.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:</p>
            <div className="mt-3 p-4 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-foreground font-medium">FirmFlow Ltd</p>
              <p>Email: privacy@firmflow.co.uk</p>
              <p>Address: United Kingdom</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
