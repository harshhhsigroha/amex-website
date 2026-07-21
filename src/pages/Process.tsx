import PageLayout from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { Scale, ShieldCheck, FileText, ArrowRight, CheckCircle2, Clock, BarChart3 } from 'lucide-react';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function Process() {
  const steps = [
    {
      n: '01', icon: Scale, title: 'Employment Status Determination',
      desc: 'We provide guidance and tools to determine correct employment classification. Our experts clarify tax obligations, National Insurance contributions, benefits entitlements, and legal rights - supporting compliance with UK labour laws.',
      details: ['IR35 status assessment', 'HMRC compliance checks', 'Worker classification analysis', 'Tax obligation guidance', 'Legal rights clarification'],
    },
    {
      n: '02', icon: ShieldCheck, title: 'Worry-Free Compliance',
      desc: 'We help your organisation or individual consistently follows the latest laws, regulations, and standards relevant to your industry. Quarterly audits keep you prepared for any regulatory changes.',
      details: ['Quarterly compliance audits', 'Regulatory updates monitoring', 'Industry-specific standards', 'Risk assessment reports', 'Corrective action plans'],
    },
    {
      n: '03', icon: FileText, title: 'Quality Payroll Outsourcing',
      desc: 'End-to-end payroll processing including calculating wages, taxes, and deductions, helping compliance with all regulations, and handling employee payments - freeing your business to focus on core activities.',
      details: ['Wage & salary calculations', 'Tax & NI deductions', 'Pension contributions', 'Payslip generation', 'HMRC submissions'],
    },
  ];

  return (
    <PageLayout>
      <section className="py-20 px-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.p {...fade} className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">Our Process</motion.p>
          <motion.h1 {...fade} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(2.5rem,5vw,4rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
            Employment Status, Payroll & HR
          </motion.h1>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            A streamlined three-step process that helps compliance, accuracy, and peace of mind for your organisation.
          </motion.p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto space-y-8">
          {steps.map((step, i) => (
            <motion.div key={step.n} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
              className="glass-premium rounded-3xl p-8 md:p-10">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center md:items-start shrink-0">
                  <span className="text-5xl font-semibold text-primary/15 mb-4">{step.n}</span>
                  <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-foreground mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{step.desc}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {step.details.map(d => (
                      <div key={d} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> {d}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-medium text-foreground text-center mb-12">Why choose our process?</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Clock, title: 'Save Time', desc: 'Streamlined workflows eliminate hours of manual processing each week.' },
              { icon: ShieldCheck, title: 'Stay Compliant', desc: 'Every step is designed around UK regulations and HMRC requirements.' },
              { icon: BarChart3, title: 'Full Visibility', desc: 'Transparent reporting at every stage so you can see where things stand.' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="glass-premium rounded-2xl p-7 text-center group  transition-all duration-500">
                <div className="w-12 h-12 rounded-xl glass mx-auto mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <item.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-medium text-foreground mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8">Let us handle the complexity of employment status, payroll, and compliance.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            Contact Us <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
