import PageLayout from '@/components/layout/PageLayout';
import IndustriesSection from '@/components/IndustriesSection';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle2, ArrowRight, Users, Shield, TrendingUp, Heart } from 'lucide-react';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function HRServices() {
  return (
    <PageLayout>
      <section className="py-20 px-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.p {...fade} className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">Our Services</motion.p>
          <motion.h1 {...fade} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(2.5rem,5vw,4rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
            HR Services
          </motion.h1>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            Professional HR support to help workplaces thrive. From recruitment and onboarding through to performance management and legal risk support, we take care of the people side of your business.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-medium text-foreground mb-4">Comprehensive HR support</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Whether you're about to take on your first member of staff or you're managing a workforce of several hundred people, our broad experience lets us offer solutions shaped to your business needs.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Our services cover a wide range of areas, including working through sensitive issues, managing absence, growing or reshaping your team, handling performance matters, and understanding your legal responsibilities as an employer.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Let us guide you through the detail of employment law, helping you steer clear of possible challenges that can arise during recruitment, redundancy, and everything in between.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Users, title: 'Employee Engagement', desc: 'Build a positive workplace culture that attracts and helps retain top talent.' },
                { icon: Shield, title: 'Legal Risk Mitigation', desc: 'Proactive legal support so you can operate with greater confidence.' },
                { icon: TrendingUp, title: 'Performance Management', desc: 'Structured processes to develop your team and support business results.' },
                { icon: Heart, title: 'Workforce Stability', desc: 'HR improvements aimed at higher retention and lower recruitment costs.' },
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
              'Recruitment & onboarding support',
              'Performance management frameworks',
              'Employee engagement programmes',
              'Legal risk mitigation',
              'Workforce planning & staffing',
              'Absence management',
              'Disciplinary & grievance support',
              'Employment law guidance',
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
          <h2 className="text-2xl font-medium text-foreground mb-4">Need HR support?</h2>
          <p className="text-muted-foreground mb-8">Our team is on hand to help you build and run a thriving workplace.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
