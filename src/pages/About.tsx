import PageLayout from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { Sparkles, Headphones, ShieldCheck, Users, Scale, Building2, CheckCircle2, Star } from 'lucide-react';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function About() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="py-20 px-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.p {...fade} className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">About Us</motion.p>
          <motion.h1 {...fade} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(2.5rem,5vw,4rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
            Leading the way in innovation
          </motion.h1>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            Our success comes from working hard to offer a compliant, customer-focused service that benefits businesses and contractors alike. Our tailored approach helps every client receive a personalised solution.
          </motion.p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Sparkles, title: 'See What Sets Us Apart', desc: 'A compliant, customer-focused service that benefits businesses and contractors, shaped around the needs of your particular industry.' },
              { icon: Headphones, title: 'Round-the-Clock Support', desc: 'Our round-the-clock support means help is on hand wherever you happen to be, ready whenever you need it.' },
              { icon: ShieldCheck, title: 'Compliance-Led Approach', desc: 'Thorough compliance audits carried out each quarter help keep organisations informed of regulatory requirements and ready for upcoming changes.' },
              { icon: Users, title: 'Stable Workforces', desc: 'Improvements to our HR processes can support higher staff retention, helping build a stable workforce that backs long-term organisational growth.' },
              { icon: Scale, title: 'Employment Law Knowledge', desc: 'We help you work through the complexities of employment law, supporting you in avoiding potential difficulties around recruitment, redundancy, and beyond.' },
              { icon: Building2, title: 'Tailored Solutions', desc: 'Whether you are taking on your first employee or overseeing hundreds, our broad experience allows us to offer creative solutions built around you.' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                className="glass-premium rounded-2xl p-7 group  transition-all duration-500">
                <div className="w-11 h-11 rounded-xl glass flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                  <item.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: 'High', label: 'Quality Driven' },
              { value: '90+', label: 'Clientele' },
              { value: '45+', label: 'Business Advisory Engagements' },
              { value: '98%', label: 'Employee Satisfaction Rate' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                className="glass-premium rounded-2xl p-6">
                <p className="text-3xl font-medium text-foreground mb-1">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-3xl mx-auto">
          <div className="glass-premium rounded-3xl p-10 text-center">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-primary fill-primary" />)}
            </div>
            <p className="text-lg text-foreground leading-relaxed mb-6 italic">
              "The straightforward interface and easy access to payroll data have made the whole process clear and simple. AMEX has consistently shown a strong level of professionalism, responsiveness, and adaptability to what we need."
            </p>
            <p className="text-sm font-medium text-foreground">Jane Jordan</p>
            <p className="text-xs text-muted-foreground">Client</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-medium text-foreground mb-4">Ready to start working together?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Reach out today to find out how AMEX Outsourcing can support your business.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            Contact Us <CheckCircle2 className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
