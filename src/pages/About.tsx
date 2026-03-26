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
            Be at the forefront of innovation
          </motion.h1>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            We have achieved our success through endeavours to provide a compliant and customer-focused service that benefits both businesses and contractors. Our tailored approach ensures every client receives personalised solutions.
          </motion.p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Sparkles, title: 'Discover the Difference', desc: 'A compliant and customer-focused service that benefits both businesses and contractors, tailored to your specific industry needs.' },
              { icon: Headphones, title: '24/7 Customer Support', desc: 'Round-the-clock support means you are being looked after wherever you are in the world. Always available when you need us.' },
              { icon: ShieldCheck, title: 'Compliance First', desc: 'Comprehensive compliance audits conducted every quarter, keeping organisations updated with regulatory requirements and prepared for changes.' },
              { icon: Users, title: 'Workforce Stability', desc: 'Our HR process improvements lead to higher employee retention, creating a stable workforce that supports long-term organisational growth.' },
              { icon: Scale, title: 'Legal Expertise', desc: 'Navigate the intricate landscape of employment law, ensuring you avoid possible challenges during recruitment, redundancy, and beyond.' },
              { icon: Building2, title: 'Bespoke Solutions', desc: 'Whether hiring your first staff member or managing hundreds, our extensive expertise allows us to provide innovative, tailored solutions.' },
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
              { value: '100%', label: 'Quality Assured' },
              { value: '90+', label: 'Clientele' },
              { value: '45+', label: 'Business Advices' },
              { value: '98%', label: 'Employee Satisfaction' },
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
              "The user-friendly interface and accessibility of payroll-related data have made the entire process transparent and hassle-free. AMEX has consistently demonstrated a high level of professionalism, responsiveness, and adaptability to our specific needs."
            </p>
            <p className="text-sm font-medium text-foreground">Jane Jordan</p>
            <p className="text-xs text-muted-foreground">Client</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-medium text-foreground mb-4">Ready to work with us?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Get in touch today and discover how AMEX Outsourcing can support your business.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            Contact Us <CheckCircle2 className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
