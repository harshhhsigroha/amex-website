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
            AMEX Outsourcing focuses on Employment Status, Payroll, and HR services, offering your company bespoke support designed to help with protection and alignment with legal and regulatory requirements. Our in-house team brings a strong understanding of the complexities involved in managing employment relationships, particularly within sectors like construction, where HMRC's enforcement activity continues to increase.
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-5xl mx-auto mt-12 relative z-10">
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
            <img src={constructionImg} alt="Construction professionals reviewing blueprints on site" className="w-full h-[320px] object-cover" width={1280} height={720} />
          </div>
        </motion.div>
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
            How can AMEX support your company's compliance?
          </motion.h2>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm text-muted-foreground text-center leading-relaxed max-w-3xl mx-auto">
            AMEX Outsourcing focuses on employment status, payroll, and HR services tailored to help companies manage compliance and reduce risk. With experience across sectors such as construction, AMEX supports businesses in meeting legal standards, lowering the chance of penalties, and keeping pace with regulatory change. From worker classification and payroll management to HR strategy and contract support, AMEX offers rounded solutions that help companies focus on growth while maintaining compliance and protection.
          </motion.p>
        </div>
      </section>

      {/* Construction Services */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fade} className="text-2xl font-medium text-foreground text-center mb-10">Construction Services</motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Scale, title: 'Employment Status', desc: 'Careful worker classification in line with HMRC guidance, IR35 regulations, and CIS requirements to help protect your business.' },
              { icon: FileText, title: 'Payroll Services', desc: 'Rounded payroll processing for site operatives and subcontractors, including CIS deductions, holiday pay, and payslip generation.' },
              { icon: Users, title: 'HR Services', desc: 'End-to-end HR support covering recruitment, onboarding, right-to-work checks, and ongoing workforce management across multiple sites.' },
              { icon: ShieldCheck, title: 'Navigating HMRC Scrutiny and Risk Mitigation', desc: 'Proactive compliance approaches and audit-ready documentation to help prepare your business for HMRC enquiries and reduce exposure to penalties.' },
              { icon: Briefcase, title: 'Expertly Crafted Contracts and Dedicated Support', desc: 'Bespoke contracts suited to the construction sector, backed by ongoing expert guidance to adapt to regulatory change.' },
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
          <h2 className="text-2xl font-medium text-foreground mb-4">Ready to make your construction workforce easier to manage?</h2>
          <p className="text-muted-foreground mb-8">Talk to our team about how we can support your business with compliant, dependable services.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
