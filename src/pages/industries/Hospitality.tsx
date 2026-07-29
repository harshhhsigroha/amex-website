import PageLayout from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { Utensils, ArrowRight, Scale, FileText, Users, ShieldCheck, Eye, BookOpen, HeadphonesIcon } from 'lucide-react';
import hospitalityImg from '@/assets/industry-hospitality.jpg';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function Hospitality() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="py-20 px-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div {...fade} className="inline-flex items-center gap-2 text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">
            <Utensils className="w-4 h-4" /> Industry
          </motion.div>
          <motion.h1 {...fade} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(2.5rem,5vw,4rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
            Hospitality
          </motion.h1>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            AMEX Outsourcing focuses on delivering bespoke Payroll, HR, employment status, and compliance services designed for businesses in the hospitality sector, whatever their size.
          </motion.p>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.3 }}
            className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed mt-4">
            In an environment with growing regulatory attention, HMRC has stepped up its focus on contractor employment, particularly within sectors like hospitality, where temporary, seasonal, or freelance workers are widely used. Misclassifying these workers, whether kitchen staff, bartenders, or front-of-house employees, can lead to significant financial penalties, backdated tax liabilities, and reputational harm. At AMEX Outsourcing, we help hospitality businesses avoid these costly mistakes by offering expert guidance on employment status, supporting the correct classification of workers whether they are permanent staff, freelancers, or contractors.
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-5xl mx-auto mt-12 relative z-10">
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
            <img src={hospitalityImg} alt="Hospitality staff serving guests in an upscale restaurant" className="w-full h-[320px] object-cover" width={1280} height={720} />
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
            Hospitality runs around the clock, and so do we. AMEX Outsourcing offers 24/7 support so that your employment status, payroll, HR, and compliance needs can be addressed at any time. Whether you need help with an urgent payroll issue, a compliance question, or an employment contract review, our dedicated teams are on hand to provide expert guidance. Our services are delivered with transparency, with no hidden fees or extra costs, so you can rely on us for consistent, high-quality support whenever it's needed.
          </motion.p>
        </div>
      </section>

      {/* Hospitality Services */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fade} className="text-2xl font-medium text-foreground text-center mb-10">Hospitality Services</motion.h2>

          {/* Payroll - featured */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-premium rounded-xl p-8 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-medium text-foreground">Customised Payroll Solutions for Hospitality</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Payroll management in hospitality can be difficult, with staff numbers fluctuating due to seasonal demand, varied shift patterns, and a mix of employment statuses. At AMEX, we provide rounded payroll services built to handle these complexities. Our payroll system helps make sure all staff, from full-time employees to part-time, casual, or zero-hour contract workers, are paid accurately and on time, while meeting tax and National Insurance obligations. We handle everything from calculating wages and overtime to managing pensions, holiday pay, and statutory deductions, freeing you up to focus on delivering excellent guest experiences.
            </p>
          </motion.div>

          {/* Other services grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Users, title: 'HR Services Tailored to the Hospitality Sector', desc: 'Rounded HR support covering recruitment, onboarding, staff retention approaches, and workforce management suited to a fast-paced hospitality setting.' },
              { icon: Scale, title: 'Navigating HMRC Scrutiny and Employment Status Compliance', desc: 'Expert guidance on worker classification, IR35, and employment status to help protect your business from HMRC enquiries, penalties, and backdated tax liabilities.' },
              { icon: ShieldCheck, title: 'Minimising Legal Risks and Optimising HR Processes', desc: 'Proactive risk management and streamlined HR processes to help lower legal exposure while improving operational efficiency across your hospitality business.' },
              { icon: HeadphonesIcon, title: 'Round-the-Clock Support and Transparent Services', desc: 'Readily-available expert support with clear pricing, no hidden fees, no surprises, so you can focus on delivering excellent guest experiences.' },
              { icon: BookOpen, title: 'Expert Guidance and Industry Insights', desc: 'Keep pace with regulatory change through expert guidance on employment law, HMRC updates, and hospitality-specific compliance requirements.' },
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
          <h2 className="text-2xl font-medium text-foreground mb-4">Ready to make your hospitality workforce easier to manage?</h2>
          <p className="text-muted-foreground mb-8">Talk to our team about how we can support your business with compliant, dependable services.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
