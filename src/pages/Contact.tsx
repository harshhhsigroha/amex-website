import PageLayout from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', contractors: '', message: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.company) {
      setFormError('Please fill in your name, email, and company.');
      return;
    }
    setFormError('');
    setFormSubmitting(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/send-contact-email`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) { setFormSuccess(true); setFormData({ name: '', email: '', company: '', contractors: '', message: '' }); }
      else setFormError(data.error || 'Something went wrong.');
    } catch { setFormError('Network error. Please try again.'); }
    finally { setFormSubmitting(false); }
  };

  return (
    <PageLayout>
      <section className="py-20 px-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.p {...fade} className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">Contact</motion.p>
          <motion.h1 {...fade} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(2.5rem,5vw,4rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
            Get in touch with us
          </motion.h1>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            Whether you need employment status guidance, payroll support, or HR services — our team is here to help.
          </motion.p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-12 px-6 bg-background">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { icon: MapPin, label: 'Visit Us', value: 'Pemberton House, Stafford Park 1, TF3 3BD', href: 'https://maps.google.com/?q=Pemberton+House+Stafford+Park+1+TF3+3BD' },
            { icon: Phone, label: 'Call Us', value: '01952 973737', href: 'tel:+01952973737' },
            { icon: Mail, label: 'Email Us', value: 'info@amexoutsourcing.com', href: 'mailto:info@amexoutsourcing.com' },
          ].map((item, i) => (
            <motion.a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              className="glass-premium rounded-2xl p-8 text-center block group  transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl glass mx-auto mb-5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <item.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-foreground mb-2">{item.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.value}</p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-premium rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Send us a message</p>
                <p className="text-xs text-muted-foreground">We reply within 1 business hour</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">First Name *</label>
                  <input type="text" placeholder="Jane" value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="w-full h-10 px-4 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Last Name</label>
                  <input type="text" placeholder="Smith"
                    className="w-full h-10 px-4 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Work Email *</label>
                <input type="email" placeholder="jane@company.co.uk" value={formData.email}
                  onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                  className="w-full h-10 px-4 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Company Name *</label>
                <input type="text" placeholder="Acme Ltd" value={formData.company}
                  onChange={e => setFormData(f => ({ ...f, company: e.target.value }))}
                  className="w-full h-10 px-4 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">How many contractors?</label>
                <select value={formData.contractors} onChange={e => setFormData(f => ({ ...f, contractors: e.target.value }))}
                  className="w-full h-10 px-4 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-muted-foreground appearance-none cursor-pointer">
                  <option value="">Select a range...</option>
                  <option>1 – 50</option><option>51 – 200</option><option>201 – 500</option><option>501 – 1,000</option><option>1,000+</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Message</label>
                <textarea placeholder="Tell us about your needs..." rows={4} value={formData.message}
                  onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50 resize-none" />
              </div>
              {formError && <p className="text-xs text-destructive text-center">{formError}</p>}
              {formSuccess ? (
                <div className="w-full rounded-xl h-12 flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Message sent! We'll be in touch shortly.
                </div>
              ) : (
                <Button disabled={formSubmitting} onClick={handleSubmit}
                  className="w-full rounded-xl h-12 shadow-lg shadow-primary/20 gap-2 text-sm font-medium">
                  {formSubmitting ? 'Sending...' : <><Send className="w-4 h-4" /> Send Message</>}
                </Button>
              )}
              <p className="text-[10px] text-muted-foreground text-center">No commitment. We reply within 1 business hour.</p>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}
