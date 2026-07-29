import PageLayout from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { HeartPulse, ArrowRight, Scale, FileText, Users, ShieldCheck, Eye, BookOpen, HeadphonesIcon } from 'lucide-react';
import healthcareImg from '@/assets/industry-healthcare.jpg';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function Healthcare() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="py-20 px-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div {...fade} className="inline-flex items-center gap-2 text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">
            <HeartPulse className="w-4 h-4" /> Industry
          </motion.div>
          <motion.h1 {...fade} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(2.5rem,5vw,4rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
            Healthcare
          </motion.h1>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            AMEX Outsourcing focuses on delivering tailored Employment Status, Payroll, HR and compliance services for healthcare organisations of any size. In a heavily regulated sector where accurate worker classification and payroll management matter greatly, our services are shaped around the needs of healthcare providers, supporting compliance within a complex regulatory landscape.
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-5xl mx-auto mt-12 relative z-10">
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
            <img src={healthcareImg} alt="Healthcare professionals collaborating in a modern hospital" className="w-full h-[320px] object-cover" width={1280} height={720} />
          </div>
        </motion.div>
      </section>

      {/* Included Services */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fade} className="text-2xl font-medium text-foreground text-center mb-10">Included Services</motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, title: 'Specialised Compliance Services' },
              { icon: Scale, title: 'Accurate Worker Classification' },
              { icon: FileText, title: 'Customised Payroll Management' },
              { icon: Users, title: 'Optimised HR Processes' },
              { icon: Eye, title: 'Continuous Compliance Monitoring' },
              { icon: BookOpen, title: 'Expertise in Regulatory Insights' },
              { icon: HeadphonesIcon, title: '24/7 Support and Transparency' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                className="glass-premium rounded-xl p-6 flex items-start gap-4 group transition-all duration-500">
                <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <item.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 24/7 Support */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fade} className="text-2xl font-medium text-foreground text-center mb-4">
            Round-the-Clock Support and Transparent Services
          </motion.h2>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm text-muted-foreground text-center leading-relaxed max-w-3xl mx-auto">
            Healthcare runs around the clock, and so do we. AMEX Outsourcing offers 24/7 support so that your employment status, payroll, HR, and compliance needs can be addressed at any time. Whether you need help with an urgent payroll issue, a compliance question, or an employment contract review, our dedicated teams are on hand to provide expert guidance. Our services are delivered with transparency, with no hidden fees or extra costs, so you can rely on us for consistent, high-quality support whenever it's needed.
          </motion.p>
        </div>
      </section>

      {/* Healthcare Services */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fade} className="text-2xl font-medium text-foreground text-center mb-10">Healthcare Services</motion.h2>

          {/* Compliance - featured */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-premium rounded-xl p-8 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-medium text-foreground">Compliance and Employment Status in Healthcare</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The healthcare sector often relies on a combination of full-time employees, part-time workers, and self-employed contractors, such as locum doctors, agency nurses, and temporary healthcare professionals. With HMRC paying closer attention to employment status, particularly for contractors, healthcare providers face the risk of misclassification, which could lead to significant financial penalties, back taxes, and reputational harm. Errors in worker classification can also cause legal disputes and operational disruption that may affect patient care.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AMEX Outsourcing helps make sure your workforce is classified accurately in line with current HMRC guidance, including IR35 legislation. We provide precise, expert assessments of employment status to help safeguard your organisation from compliance risks. Whether dealing with temporary staff, consultants, or permanent employees, we help put the right legal framework in place to avoid costly mistakes. Our employment status services support proper documentation for contractors, locum workers, and agency staff, helping prevent misclassification errors that could lead to fines or legal challenges.
            </p>
          </motion.div>

          {/* Other services grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: FileText, title: 'Payroll Solutions Tailored for Healthcare', desc: 'Rounded payroll management designed for the complexities of healthcare staffing, including variable shifts, locum payments, and agency worker compensation.' },
              { icon: Users, title: 'HR Process Optimization for Healthcare Providers', desc: 'Streamlined HR processes covering recruitment, onboarding, staff management, and compliance training suited to healthcare regulations.' },
              { icon: ShieldCheck, title: 'Minimising Legal Risks and Supporting Regulatory Compliance', desc: 'Proactive risk management approaches and audit-ready documentation to help protect your organisation from regulatory penalties and legal challenges.' },
              { icon: BookOpen, title: 'Expert Guidance and Up-to-Date Insights', desc: 'Keep pace with regulatory change through expert guidance on employment law, HMRC updates, and healthcare-specific compliance requirements.' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                className="glass-premium rounded-xl p-6 flex flex-col gap-3 group transition-all duration-500">
                <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <item.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-medium text-foreground mb-4">Ready to make your healthcare workforce easier to manage?</h2>
          <p className="text-muted-foreground mb-8">Talk to our team about how we can support your organisation with compliant, dependable services.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
