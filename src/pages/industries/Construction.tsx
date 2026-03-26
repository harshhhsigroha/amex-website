import PageLayout from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { Hammer, CheckCircle2, ArrowRight, Scale, FileText, Briefcase, ShieldCheck, Users, HardHat, ClipboardCheck, HeadphonesIcon, TrendingUp } from 'lucide-react';
import constructionImg from '@/assets/industry-construction.jpg';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function Construction() {
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
            AMEX Outsourcing specialises in Employment Status, Payroll, and HR services, offering your company tailored services that ensure both protection and full compliance with legal and regulatory requirements. Our in-house team of experts brings a deep understanding of the complexities involved in managing employment relationships, particularly within industries like construction, where HMRC's enforcement efforts are becoming increasingly stringent.
          </motion.p>
        </div>
      </section>

      {/* Included Services */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fade} className="text-2xl font-medium text-foreground text-center mb-10">Included Services</motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Scale, title: 'Employment Status Compliance' },
              { icon: ShieldCheck, title: 'Risk Mitigation and HMRC Preparedness' },
              { icon: FileText, title: 'Comprehensive Payroll Services' },
              { icon: Briefcase, title: 'Dedicated Contract Support and Ongoing Assistance' },
              { icon: Users, title: 'HR Support' },
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

      {/* How can AMEX help */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fade} className="text-2xl font-medium text-foreground text-center mb-4">
            How can AMEX help your company stay compliant?
          </motion.h2>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm text-muted-foreground text-center leading-relaxed max-w-3xl mx-auto">
            AMEX Outsourcing specialises in employment status, payroll, and HR services tailored to help companies manage compliance and mitigate risks. With expertise in industries such as construction, AMEX ensures businesses meet legal standards, reduce penalties, and stay ahead of regulatory changes. From worker classification and payroll management to HR strategy and contract support, AMEX provides comprehensive solutions that enable companies to focus on growth while maintaining compliance and protection.
          </motion.p>
        </div>
      </section>

      {/* Construction Services */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fade} className="text-2xl font-medium text-foreground text-center mb-10">Construction Services</motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Scale, title: 'Employment Status', desc: 'Accurate worker classification aligned with HMRC guidelines, IR35 regulations, and CIS requirements to protect your business.' },
              { icon: FileText, title: 'Payroll Services', desc: 'Comprehensive payroll processing for site operatives and subcontractors, including CIS deductions, holiday pay, and payslip generation.' },
              { icon: Users, title: 'HR Services', desc: 'End-to-end HR support covering recruitment, onboarding, right-to-work checks, and ongoing workforce management across multiple sites.' },
              { icon: ShieldCheck, title: 'Navigating HMRC Scrutiny and Risk Mitigation', desc: 'Proactive compliance strategies and audit-ready documentation to prepare your business for HMRC enquiries and reduce exposure to penalties.' },
              { icon: Briefcase, title: 'Expertly Crafted Contracts and Dedicated Support', desc: 'Bespoke contracts tailored to the construction sector with ongoing expert guidance to adapt to regulatory changes.' },
              { icon: HeadphonesIcon, title: 'Guiding You Through Every Step', desc: 'A dedicated account team that works alongside your business from initial assessment through to ongoing compliance management.' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
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
