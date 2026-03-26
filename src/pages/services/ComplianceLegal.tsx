import PageLayout from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, ArrowRight, Scale, FileText, AlertTriangle, Search } from 'lucide-react';
import { Factory, Truck, Utensils, Hammer, HeartPulse, GraduationCap } from 'lucide-react';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function ComplianceLegal() {
  return (
    <PageLayout>
      <section className="py-20 px-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.p {...fade} className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">Our Services</motion.p>
          <motion.h1 {...fade} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(2.5rem,5vw,4rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
            Compliance & Legal
          </motion.h1>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            Our legal risk mitigation services are designed to be a proactive shield for your business, allowing you to operate with confidence and minimise potential legal challenges in today's dynamic business environment.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-medium text-foreground mb-4">Stay protected</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Comprehensive compliance audits are conducted every quarter, keeping organisations updated with regulatory requirements and prepared for any legal changes, helping to avoid potential risks.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Recently, there has been a noticeable increase in individuals seeking greater autonomy and adaptability in their professional endeavours. This has increased the need for proper compliance frameworks and legal support.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Partner with us to fortify your legal foundation and secure the longevity of your enterprise. We navigate you through the intricate landscape of employment law.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Search, title: 'Quarterly Audits', desc: 'Regular compliance reviews to keep you ahead of regulatory changes.' },
                { icon: Scale, title: 'Legal Support', desc: 'Expert guidance on employment law, recruitment, and redundancy matters.' },
                { icon: AlertTriangle, title: 'Risk Mitigation', desc: 'Proactive identification and prevention of potential legal challenges.' },
                { icon: FileText, title: 'Documentation', desc: 'HMRC-ready documentation and audit trails for complete peace of mind.' },
              ].map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  className="glass-premium rounded-xl p-5 flex items-start gap-4 group  transition-all duration-500">
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

      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-medium text-foreground text-center mb-10">What's included</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Quarterly compliance audits',
              'Regulatory change monitoring',
              'Employment law guidance',
              'Legal risk assessments',
              'HMRC-ready documentation',
              'Corrective action plans',
              'Industry-specific compliance',
              'Ongoing advisory support',
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

      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-medium text-foreground mb-4">Need compliance support?</h2>
          <p className="text-muted-foreground mb-8">Protect your business with our comprehensive compliance and legal services.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
