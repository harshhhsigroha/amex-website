import PageLayout from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

const PrivacyPolicy = () => {
  return (
    <PageLayout>
      <section className="py-20 px-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.p {...fade} className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">Legal</motion.p>
          <motion.h1 {...fade} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(2.5rem,5vw,4rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
            Privacy Policy
          </motion.h1>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            Effective Date: 18 March 2026
          </motion.p>
        </div>
      </section>

      <section className="py-16 px-6 bg-background border-t border-border/20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto">

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            AMEX Outsourcing (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to safeguarding your privacy. This Privacy Policy sets out how we collect, use, disclose, and protect your personal data in line with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-10">
            By using our website (<a href="https://amexoutsourcing.com/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://amexoutsourcing.com/</a>) or engaging with our services, you accept the practices set out in this policy.
          </p>

          <h2 className="text-lg font-medium text-foreground mb-4">1. Information We Collect</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">We may collect both Personal Information and Non-Personal Information.</p>
          <h3 className="text-sm font-medium text-foreground mb-2">a. Personal Information</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">This includes:</p>
          <ul className="list-disc pl-5 space-y-1 mb-5">
            {['Name', 'Email address', 'Phone number', 'Company name', 'Job title', 'Any information you provide via forms, email, or communication'].map(item => (
              <li key={item} className="text-sm text-muted-foreground">{item}</li>
            ))}
          </ul>
          <h3 className="text-sm font-medium text-foreground mb-2">b. Non-Personal Information</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">This includes:</p>
          <ul className="list-disc pl-5 space-y-1 mb-10">
            {['IP address', 'Browser type', 'Pages visited', 'Time spent on site', 'Referring website', 'Cookies and tracking data'].map(item => (
              <li key={item} className="text-sm text-muted-foreground">{item}</li>
            ))}
          </ul>

          <h2 className="text-lg font-medium text-foreground mb-4">2. How We Use Your Information</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">We use your data to:</p>
          <ul className="list-disc pl-5 space-y-1 mb-10">
            {['Respond to enquiries and requests', 'Provide services and manage client relationships', 'Improve website functionality and user experience', 'Send updates or marketing communications (with an option to opt out)', 'Carry out analytics and internal research', 'Support security, help prevent fraud, and meet legal obligations'].map(item => (
              <li key={item} className="text-sm text-muted-foreground">{item}</li>
            ))}
          </ul>

          <h2 className="text-lg font-medium text-foreground mb-4">3. Credit Reference and Affordability Checks</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">To help us assess applications, prevent fraud, and meet our legal and regulatory obligations, we may obtain information about you from credit reference agencies (CRAs).</p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">We obtain this information via Creditsafe, which uses its data partner TransUnion to supply consumer credit and identity data.</p>
          <div className="glass-premium rounded-xl p-5 space-y-3 mb-4">
            <div>
              <p className="text-sm font-medium text-foreground">Creditsafe Business Solutions Limited</p>
              <p className="text-xs text-muted-foreground">Authorised and regulated by the Financial Conduct Authority - FCA Firm Reference Number: 742313</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">TransUnion International UK Limited</p>
              <p className="text-xs text-muted-foreground">Authorised and regulated by the Financial Conduct Authority - FCA Firm Reference Number: 805757</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">The information we receive may include data relating to your identity, credit commitments, payment history, and public record information. This data is used solely for legitimate business purposes, including assessing creditworthiness, verifying identity, and preventing fraud, in line with applicable data protection laws.</p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">Further information can be found at:</p>
          <ul className="list-disc pl-5 space-y-1 mb-10">
            <li className="text-sm text-muted-foreground"><a href="https://www.creditsafe.com/gb/en/legal/privacy-policy.html" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Creditsafe Transparency Notice</a></li>
            <li className="text-sm text-muted-foreground"><a href="https://www.transunion.co.uk/legal/privacy-centre/pc-credit-reference" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">TransUnion CRAIN</a></li>
            <li className="text-sm text-muted-foreground"><a href="https://www.transunion.co.uk/legal/privacy-centre/pc-bureau" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">TransUnion Bureau Privacy Notice</a></li>
          </ul>

          <h2 className="text-lg font-medium text-foreground mb-4">4. Legal Basis for Processing Personal Data</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">We process personal data on the following lawful bases:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Performance of a contract</span> - to provide services and meet contractual obligations</li>
            <li className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Legal obligation</span> - to meet regulatory and legal requirements</li>
            <li className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Legitimate interests</span> - for business operations, fraud prevention, compliance, and security</li>
            <li className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Consent</span> - where required, which can be withdrawn at any time</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mb-10">Where we rely on legitimate interests, we aim to have appropriate safeguards in place.</p>

          <h2 className="text-lg font-medium text-foreground mb-4">5. Legitimate Interests</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">Our legitimate interests include:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            {['Operating and improving our business', 'Preventing fraud and supporting security', 'Compliance, audit, and regulatory obligations', 'Protecting third-party data (including TransUnion data)'].map(item => (
              <li key={item} className="text-sm text-muted-foreground">{item}</li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mb-10">These are weighed against your rights and freedoms.</p>

          <h2 className="text-lg font-medium text-foreground mb-4">6. Source of Personal Data</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">We may collect personal data from:</p>
          <ul className="list-disc pl-5 space-y-1 mb-10">
            {['You directly', 'Employers or clients', 'Referees (where applicable)', 'Public sources (e.g. LinkedIn, websites, public records)', 'Credit reference agencies', 'Third-party service providers supporting our operations'].map(item => (
              <li key={item} className="text-sm text-muted-foreground">{item}</li>
            ))}
          </ul>

          <h2 className="text-lg font-medium text-foreground mb-4">7. How We Share Your Information</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">We do not sell your data. We may share it with:</p>
          <ul className="list-disc pl-5 space-y-1 mb-10">
            {['Service providers (hosting, analytics, CRM, compliance tools)', 'Credit reference agencies (as described above)', 'Legal authorities where required', 'Business transfers (e.g. mergers or acquisitions)'].map(item => (
              <li key={item} className="text-sm text-muted-foreground">{item}</li>
            ))}
          </ul>

          <h2 className="text-lg font-medium text-foreground mb-4">8. International Data Transfers</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">We may transfer personal data outside the UK or EEA. Where this happens, we look to put safeguards in place such as:</p>
          <ul className="list-disc pl-5 space-y-1 mb-10">
            {['Standard Contractual Clauses (SCCs)', 'International Data Transfer Agreements (IDTAs)', 'Transfers to countries with adequacy decisions'].map(item => (
              <li key={item} className="text-sm text-muted-foreground">{item}</li>
            ))}
          </ul>

          <h2 className="text-lg font-medium text-foreground mb-4">9. Data Retention</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">We keep personal data only for as long as needed.</p>
          <ul className="list-disc pl-5 space-y-1 mb-10">
            <li className="text-sm text-muted-foreground">Data is retained to meet business and legal obligations</li>
            <li className="text-sm text-muted-foreground">Credit-related data is kept only as required and then securely deleted</li>
          </ul>

          <h2 className="text-lg font-medium text-foreground mb-4">10. Cookies and Tracking Technologies</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">We use cookies to:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li className="text-sm text-muted-foreground">Improve user experience</li>
            <li className="text-sm text-muted-foreground">Analyse website usage</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mb-10">You can turn off cookies via your browser settings, though some features may not work as intended as a result.</p>

          <h2 className="text-lg font-medium text-foreground mb-4">11. Your Rights</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            {['Access your personal data', 'Rectify inaccurate data', 'Erase your data where applicable', 'Restrict processing', 'Data portability', 'Object to processing (including marketing)'].map(item => (
              <li key={item} className="text-sm text-muted-foreground">{item}</li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mb-10">To exercise your rights, contact: <a href="mailto:hello@amexoutsourcing.com" className="text-primary hover:underline">hello@amexoutsourcing.com</a></p>

          <h2 className="text-lg font-medium text-foreground mb-4">12. Complaints</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-10">You have the right to lodge a complaint with the UK Information Commissioner&apos;s Office (ICO): <a href="https://www.ico.org.uk" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://www.ico.org.uk</a></p>

          <h2 className="text-lg font-medium text-foreground mb-4">13. Provision of Personal Data</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">Providing personal data is:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Contractual</span> - needed to deliver services</li>
            <li className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Sometimes legal</span> - needed for compliance</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">If you do not provide the data we ask for:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li className="text-sm text-muted-foreground">We may be unable to provide services</li>
            <li className="text-sm text-muted-foreground">Contracts may not be fulfilled</li>
            <li className="text-sm text-muted-foreground">Verification and compliance checks may not be completed</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mb-10">Optional data (e.g. for marketing) is not mandatory.</p>

          <h2 className="text-lg font-medium text-foreground mb-4">14. Automated Decision Making and Profiling</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">In some circumstances, we may use automated decision making or profiling with personal data. This involves automated systems assessing certain information about an individual, such as risk factors, affordability indicators, or fraud signals, based on predefined rules or algorithms.</p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">Where automated decision making is used, it may lead to outcomes such as the approval, restriction, or rejection of an application or service.</p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-10">Individuals have the right to request human involvement, to express their point of view, and to challenge decisions made solely by automated means. Further information about automated decision making and how to exercise these rights can be obtained by contacting us using the details in this Privacy Policy.</p>

          <h2 className="text-lg font-medium text-foreground mb-4">15. Data Security</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-10">We put appropriate technical and organisational measures in place to help protect your data. That said, no system can be considered entirely secure.</p>

          <h2 className="text-lg font-medium text-foreground mb-4">16. Third-Party Links</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-10">We are not responsible for third-party websites linked from our site. Please check their privacy policies separately.</p>

          <h2 className="text-lg font-medium text-foreground mb-4">17. Contact Details</h2>
          <div className="glass-premium rounded-xl p-5 space-y-2 mb-10">
            <p className="text-sm font-medium text-foreground">AMEX Outsourcing</p>
            <p className="text-sm text-muted-foreground">Email: <a href="mailto:hello@amexoutsourcing.com" className="text-primary hover:underline">hello@amexoutsourcing.com</a></p>
            <p className="text-sm text-muted-foreground">Phone: <a href="tel:+01952973737" className="text-primary hover:underline">01952 973737</a></p>
            <p className="text-sm text-muted-foreground">Address: Pemberton House, Stafford Park 1, TF3 3BD</p>
          </div>

          <h2 className="text-lg font-medium text-foreground mb-4">18. Data Protection Officer (DPO)</h2>
          <div className="glass-premium rounded-xl p-5 space-y-2 mb-10">
            <p className="text-sm font-medium text-foreground">Lili</p>
            <p className="text-sm text-muted-foreground">Email: <a href="mailto:lili@amexoutsourcing.com" className="text-primary hover:underline">lili@amexoutsourcing.com</a></p>
          </div>

          <h2 className="text-lg font-medium text-foreground mb-4">19. Changes to This Policy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">We may update this policy from time to time. Updates will be posted along with a revised effective date.</p>
          <p className="text-sm text-muted-foreground leading-relaxed">By using our services, you confirm that you have read and understood this Privacy Policy.</p>

        </motion.div>
      </section>
    </PageLayout>
  );
};

export default PrivacyPolicy;
