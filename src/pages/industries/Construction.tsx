import PageLayout from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { Hammer, CheckCircle2, ArrowRight, Scale, FileText, Briefcase, ShieldCheck, Users, HardHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function Construction() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      {/* Hero */}
      <section className="py-20 px-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div {...fade} className="inline-flex items-center gap-2 text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">
            <Hammer className="w-4 h-4" /> Industry
          </motion.div>
          <motion.h1 {...fade} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(2.5rem,5vw,4rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
            Construction
          </motion.h1>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            Employment status, payroll, and HR solutions built for the construction industry — from site operatives to subcontractors, we help you stay compliant and keep projects moving.
          </motion.p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-medium text-foreground mb-4">Built for construction</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                The construction sector relies heavily on subcontractors, agency workers, and self-employed operatives. With IR35 reforms, CIS requirements, and evolving employment law, getting worker classification right is critical to avoiding costly penalties and project delays.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                We understand the unique challenges of construction — from managing a workforce that changes week to week to ensuring every operative is correctly classified and paid on time. Our services are designed to give you confidence on every project.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Whether you're a main contractor, specialist subcontractor, or labour provider, we tailor our approach to your specific needs and the regulatory demands of your supply chain.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Scale, title: 'IR35 & CIS Compliance', desc: 'Accurate status determinations for subcontractors and operatives, aligned with HMRC guidelines and CIS regulations.' },
                { icon: FileText, title: 'Construction Payroll', desc: 'Weekly payroll processing for site workers with CIS deductions, holiday pay calculations, and payslip generation.' },
                { icon: Users, title: 'Workforce Management', desc: 'HR support for recruitment, onboarding, and managing a flexible workforce across multiple sites.' },
                { icon: ShieldCheck, title: 'Audit-Ready Documentation', desc: 'Full documentation and audit trails to protect your business in the event of an HMRC enquiry.' },
              ].map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  className="glass-premium rounded-xl p-5 flex items-start gap-4 group transition-all duration-500">
                  <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <item.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services tailored */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-medium text-foreground text-center mb-4">How we support construction businesses</h2>
          <p className="text-sm text-muted-foreground text-center mb-10 max-w-lg mx-auto">Our services are tailored to the specific regulatory and operational needs of the construction sector.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'IR35 status determinations',
              'CIS registration & deductions',
              'Weekly payroll for site operatives',
              'Subcontractor payment management',
              'Right to work verification',
              'Holiday pay & entitlement tracking',
              'HMRC-ready documentation',
              'Multi-site workforce support',
            ].map((item, i) => (
              <motion.div key={item} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-medium text-foreground mb-4">Ready to simplify your construction workforce?</h2>
          <p className="text-muted-foreground mb-8">Speak to our team about how we can support your business with compliant, reliable services.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
