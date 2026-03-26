import PageLayout from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { Utensils, CheckCircle2, ArrowRight, Scale, FileText, Briefcase, ShieldCheck, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function Hospitality() {
  const navigate = useNavigate();

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
            Employment, payroll, and HR solutions designed for hotels, restaurants, and hospitality businesses — managing your people so you can focus on delivering exceptional guest experiences.
          </motion.p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-medium text-foreground mb-4">Tailored for hospitality</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                The hospitality sector is fast-paced and people-driven, with high staff turnover, variable shift patterns, and a mix of permanent, casual, and agency workers. Managing employment status, payroll, and compliance can be a significant challenge.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                We support hotels, restaurant groups, event venues, and catering companies with reliable payroll, correct worker classification, and proactive HR support — helping you reduce administrative burden and stay compliant.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                From tronc scheme management and tips distribution to seasonal staffing and zero-hours contracts, our team has the expertise to handle the specific needs of the hospitality industry.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Scale, title: 'Worker Classification', desc: 'Correct classification of permanent staff, casual workers, and freelancers to avoid employment disputes and penalties.' },
                { icon: FileText, title: 'Hospitality Payroll', desc: 'Payroll processing for variable hours, tips and tronc distribution, holiday pay, and National Minimum Wage compliance.' },
                { icon: Users, title: 'Seasonal Staffing Support', desc: 'HR and onboarding support to help you scale your workforce up and down with seasonal demand.' },
                { icon: ShieldCheck, title: 'Employment Law Guidance', desc: 'Guidance on zero-hours contracts, right to work checks, and compliance with hospitality employment regulations.' },
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
          <h2 className="text-2xl font-medium text-foreground text-center mb-4">How we support hospitality businesses</h2>
          <p className="text-sm text-muted-foreground text-center mb-10 max-w-lg mx-auto">Services designed around the fast-moving, people-focused nature of the hospitality industry.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Worker status assessments',
              'Variable hours payroll processing',
              'Tronc scheme & tips management',
              'National Minimum Wage compliance',
              'Right to work verification',
              'Seasonal recruitment support',
              'Zero-hours contract guidance',
              'Ongoing compliance reviews',
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
          <h2 className="text-2xl font-medium text-foreground mb-4">Ready to simplify your hospitality workforce?</h2>
          <p className="text-muted-foreground mb-8">Our team is ready to support your business with reliable, compliant services tailored to hospitality.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
