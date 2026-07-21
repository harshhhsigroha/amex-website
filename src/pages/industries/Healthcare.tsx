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
            AMEX Outsourcing specialises in delivering tailored Employment Status, Payroll, HR and compliance services for healthcare organisations of any size. In a highly regulated industry where accurate worker classification and payroll management are critical, our services are customised to meet the unique needs of the healthcare sector, supporting compliance with the complex regulatory environment.
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
            Healthcare operates around the clock, and neither do we. AMEX Outsourcing offers 24/7 support to help that your employment status, payroll, HR, and compliance needs are met at any time. Whether you need assistance with an urgent payroll issue, compliance question, or employment contract review, our dedicated teams are readily available to provide expert guidance. Our services are delivered transparently, with no hidden fees or extra costs, helping that you can rely on us for consistent, high-quality support whenever you need it.
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
              The healthcare industry often relies on a mix of full-time employees, part-time workers, and self-employed contractors, such as locum doctors, agency nurses, and temporary healthcare professionals. With increasing HMRC scrutiny on employment status, particularly for contractors, healthcare providers are at risk of misclassification, which could lead to severe financial penalties, back taxes, and damage to reputations. Missteps in worker classification can also lead to legal disputes and operational disruptions that may affect patient care.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AMEX Outsourcing helps that your workforce is accurately classified in line with current HMRC guidelines, including the IR35 legislation. We offer precise, expert assessments of employment status to safeguard your organisation from compliance risks. Whether dealing with temporary staff, consultants, or permanent employees, we provide the right legal framework to avoid costly mistakes. Our employment status services help that your contractors, locum workers, and agency staff are properly documented, preventing misclassification errors that could lead to fines or legal challenges.
            </p>
          </motion.div>

          {/* Other services grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: FileText, title: 'Payroll Solutions Tailored for Healthcare', desc: 'Comprehensive payroll management designed for the complexities of healthcare staffing, including variable shifts, locum payments, and agency worker compensation.' },
              { icon: Users, title: 'HR Process Optimization for Healthcare Providers', desc: 'Streamlined HR processes covering recruitment, onboarding, staff management, and compliance training tailored to healthcare regulations.' },
              { icon: ShieldCheck, title: 'Minimising Legal Risks and Ensuring Regulatory Compliance', desc: 'Proactive risk management strategies and audit-ready documentation to protect your organisation from regulatory penalties and legal challenges.' },
              { icon: BookOpen, title: 'Expert Guidance and Up-to-Date Insights', desc: 'Stay ahead of regulatory changes with expert guidance on employment law, HMRC updates, and healthcare-specific compliance requirements.' },
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
          <h2 className="text-2xl font-medium text-foreground mb-4">Ready to streamline your healthcare workforce?</h2>
          <p className="text-muted-foreground mb-8">Speak to our team about how we can support your organisation with compliant, reliable services.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
