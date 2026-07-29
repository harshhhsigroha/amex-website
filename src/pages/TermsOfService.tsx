import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Agreement to Terms</h2>
            <p>By accessing or using the AMEX Outsourcing platform operated by AMEX Outsourcing Ltd ("Company", "we", "us"), you agree to be bound by these Terms of Service. If you do not agree to these Terms, you should not use the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>AMEX Outsourcing is a contractor payroll and invoice management platform providing tools for timesheet processing, invoice generation, self-billed invoicing, candidate onboarding, clock-in/out tracking, and file management for businesses operating in the United Kingdom.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You should provide accurate and complete information when creating an account.</li>
              <li>You are responsible for keeping your account credentials secure.</li>
              <li>You should notify us promptly of any unauthorised use of your account.</li>
              <li>We reserve the right to suspend or terminate accounts that breach these Terms.</li>
              <li>One person or entity should not maintain more than one account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the platform for any unlawful purpose or in breach of any applicable law</li>
              <li>Upload false, misleading, or fraudulent information</li>
              <li>Attempt to gain unauthorised access to other accounts or systems</li>
              <li>Interfere with or disrupt the platform's infrastructure</li>
              <li>Reverse engineer, decompile, or disassemble any part of the platform</li>
              <li>Use the platform to transmit malware or other harmful code</li>
              <li>Scrape, data mine, or extract data from the platform without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Invoicing & Financial Data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You are responsible for the accuracy of all financial data entered into the platform, including timesheets, hourly rates, and invoice details.</li>
              <li>AMEX Outsourcing generates invoices based on the data you provide. We do not independently check the accuracy of submitted financial information.</li>
              <li>You remain responsible for compliance with HMRC regulations, tax obligations, and employment law.</li>
              <li>Generated invoices and self-billed invoices should be reviewed before being submitted to HMRC or clients.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Intellectual Property</h2>
            <p>The AMEX Outsourcing platform, including its design, code, branding, and content, belongs to AMEX Outsourcing Ltd. You are granted a limited, non-exclusive, non-transferable licence to use the platform for its intended purpose. You keep ownership of the data you upload to the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Service Availability</h2>
            <p>We aim to maintain high availability but cannot promise uninterrupted service. We may carry out maintenance, updates, or changes that temporarily affect access. We will try to give reasonable notice of planned downtime.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>To the extent permitted by law, AMEX Outsourcing Ltd will not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, arising from your use of the platform. Our total liability will not exceed the amount you paid for the service in the preceding 12 months.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Indemnification</h2>
            <p>You agree to indemnify and hold harmless AMEX Outsourcing Ltd, its officers, directors, employees, and agents from any claims, losses, or damages arising from your use of the platform, your breach of these Terms, or your breach of any third-party rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Termination</h2>
            <p>Either party may end this agreement at any time. Once terminated, your right to access the platform stops. We may retain data as required by law. You may request an export of your data before your account is closed.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Governing Law</h2>
            <p>These Terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Changes to Terms</h2>
            <p>We reserve the right to update these Terms at any time. Material changes will be communicated via the platform or by email. Continuing to use the platform after changes means you accept the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">13. Contact</h2>
            <p>For questions about these Terms, please contact:</p>
            <div className="mt-3 p-4 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-foreground font-medium">AMEX Outsourcing Ltd</p>
              <p>Email: hello@amexoutsourcing.com</p>
              <p>Address: United Kingdom</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
