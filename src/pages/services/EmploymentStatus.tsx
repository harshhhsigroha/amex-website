import PageLayout from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { Scale, CheckCircle2, ArrowRight, ShieldCheck, FileText, Users } from 'lucide-react';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function EmploymentStatus() {
  return (
    <PageLayout>
      <section className="py-20 px-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.p {...fade} className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">Our Services</motion.p>
          <motion.h1 {...fade} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(2.5rem,5vw,4rem)] font-semibold text-foreground leading-tight tracking-tight mb-6">
            Employment Status
          </motion.h1>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            At AMEX Outsourcing, we help you manage your employment status seamlessly. Whether you're a self-employed contractor, agency worker, or PAYE employee, understanding your employment status is crucial for determining your tax obligations, legal rights, and the benefits you are entitled to.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">What is Employment Status?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Employment status determines how you are classified for tax purposes — whether as an employee, worker, or self-employed. This classification affects your tax obligations, National Insurance contributions, employment rights, and benefit entitlements.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Recently, there has been a noticeable increase in individuals seeking greater autonomy and adaptability in their professional endeavours. This shift has led to a significant rise in the UK's self-employed population, now totalling 4.3 million.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our expert team ensures you are correctly classified and compliant with UK laws, so you can focus on your work with peace of mind. We provide support for contractors, freelancers, and temporary workers.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Scale, title: 'IR35 Assessments', desc: 'Precise assessments to confirm correct classification status aligned with industry-specific requirements.' },
                { icon: ShieldCheck, title: 'HMRC Compliance', desc: 'Prevent future issues with reclassification, back taxes, or legal challenges.' },
                { icon: FileText, title: 'Documentation', desc: 'Full documentation trail for audit readiness and regulatory compliance.' },
                { icon: Users, title: 'Contractor Support', desc: 'Guidance for contractors, freelancers, and temporary workers on their status.' },
              ].map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  className="glass-premium rounded-xl p-5 flex items-start gap-4 group hover:glow-ring transition-all duration-500">
                  <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <item.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
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
          <h2 className="text-2xl font-semibold text-foreground text-center mb-10">What's included</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Self-employed classification accuracy assessments',
              'Quarterly compliance audits',
              'IR35 status determinations',
              'Worker classification analysis',
              'Tax obligation guidance',
              'Legal rights clarification',
              'HMRC-ready documentation',
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
          <h2 className="text-2xl font-semibold text-foreground mb-4">Need employment status guidance?</h2>
          <p className="text-muted-foreground mb-8">Our experts are ready to help you navigate the complexities of employment classification.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
