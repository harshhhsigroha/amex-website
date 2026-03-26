import PageLayout from '@/components/layout/PageLayout';
import IndustriesSection from '@/components/IndustriesSection';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, ArrowRight, FileText, Calculator, Download, Eye } from 'lucide-react';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function BillingInvoicing() {
  return (
    <PageLayout>
      <section className="py-20 px-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.p {...fade} className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">Our Services</motion.p>
          <motion.h1 {...fade} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(2.5rem,5vw,4rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
            Billing & Invoicing
          </motion.h1>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            We simplify the invoicing process. Once your timesheets are approved, we handle all invoicing on your behalf — ensuring your agency or end client receives a clear and accurate breakdown of services provided.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-medium text-foreground mb-4">Automated billing</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                At AMEX Outsourcing, we simplify the invoicing process. Once your timesheets are approved, we handle all invoicing on your behalf, ensuring your agency or end client receives a clear and accurate breakdown of the services you've provided.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Our team manages the entire invoicing process, from generating and submitting invoices to following up on payments, allowing you to focus on your core work without worrying about paperwork.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This service ensures that you are paid correctly and promptly for your services, with full VAT calculations and HMRC-compliant documentation.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: FileText, title: 'Invoice Generation', desc: 'Automatic creation of HMRC-compliant invoices from approved timesheets.' },
                { icon: Calculator, title: 'VAT Calculations', desc: 'Automatic VAT at 20% with full audit trail on every invoice.' },
                { icon: Download, title: 'Bulk Processing', desc: 'Generate self-billed invoices for all contractors simultaneously.' },
                { icon: Eye, title: 'Full Transparency', desc: 'Detailed breakdowns so you always know exactly what you are being charged.' },
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
              'Master invoice generation',
              'Self-billed invoice processing',
              'Automatic VAT calculations',
              'HMRC-compliant documents',
              'Bulk PDF generation',
              'Auto-filing by financial year',
              'Payment follow-up',
              'Full audit trail',
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

      <IndustriesSection />

      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-medium text-foreground mb-4">Need billing support?</h2>
          <p className="text-muted-foreground mb-8">Let us automate your invoicing and billing processes.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
