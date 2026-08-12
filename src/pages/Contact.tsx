import PageLayout from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { MapPin, Mail, Send, CheckCircle2, Clock, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', lastName: '', email: '', company: '', contractors: '', service: '', message: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.company) {
      setFormError('Please fill in your name, email, and company.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    setFormError('');
    setFormSubmitting(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/send-contact-email`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.name} ${formData.lastName}`.trim(),
          email: formData.email,
          company: formData.company,
          contractors: formData.contractors,
          message: `Service: ${formData.service || 'Not specified'}\n\n${formData.message}`,
        }),
      });
      const data = await res.json();
      if (res.ok) { setFormSuccess(true); setFormData({ name: '', lastName: '', email: '', company: '', contractors: '', service: '', message: '' }); }
      else setFormError(data.error || 'Something went wrong.');
    } catch { setFormError('Network error. Please try again.'); }
    finally { setFormSubmitting(false); }
  };

  return (
    <PageLayout>
      {/* Hero */}
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
            Whether you need employment status guidance, payroll support, or HR services - our team is here to help.
          </motion.p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-12 px-6 bg-background">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: MapPin, label: 'Visit Us', value: '545 Northumberland Avenue, Reading, England, RG2 8NU', href: 'https://maps.google.com/?q=545+Northumberland+Avenue+Reading+England+RG2+8NU' },
            { icon: Mail, label: 'Email Us', value: 'info@amexoutsourcing.com', href: 'mailto:info@amexoutsourcing.com' },
            { icon: Phone, label: 'Call Us', value: '020 4569 1168', href: 'tel:02045691168' },
            { icon: Clock, label: 'Office Hours', value: 'Mon - Fri, 9:00 - 17:30', href: undefined },
          ].map((item, i) => (
            <motion.a key={item.label} href={item.href} target={item.href?.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              className="glass-premium rounded-2xl p-6 text-center block group transition-all duration-500">
              <div className="w-12 h-12 rounded-xl glass mx-auto mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <item.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">{item.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.value}</p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">
          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-premium rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Send us a message</p>
                <p className="text-xs text-muted-foreground">We aim to respond within one business hour</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">First Name *</label>
                  <input type="text" placeholder="Jane" value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    maxLength={100}
                    className="w-full h-10 px-4 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Last Name</label>
                  <input type="text" placeholder="Smith" value={formData.lastName}
                    onChange={e => setFormData(f => ({ ...f, lastName: e.target.value }))}
                    maxLength={100}
                    className="w-full h-10 px-4 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Work Email *</label>
                <input type="email" placeholder="jane@company.co.uk" value={formData.email}
                  onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                  maxLength={255}
                  className="w-full h-10 px-4 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Company Name *</label>
                <input type="text" placeholder="Acme Ltd" value={formData.company}
                  onChange={e => setFormData(f => ({ ...f, company: e.target.value }))}
                  maxLength={200}
                  className="w-full h-10 px-4 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Service Interested In</label>
                  <select value={formData.service} onChange={e => setFormData(f => ({ ...f, service: e.target.value }))}
                    className="w-full h-10 px-4 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-muted-foreground appearance-none cursor-pointer">
                    <option value="">Select a service...</option>
                    <option>Employment Status</option>
                    <option>Payroll Services</option>
                    <option>HR Services</option>
                    <option>Multiple Services</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">How many contractors?</label>
                  <select value={formData.contractors} onChange={e => setFormData(f => ({ ...f, contractors: e.target.value }))}
                    className="w-full h-10 px-4 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-muted-foreground appearance-none cursor-pointer">
                    <option value="">Select a range...</option>
                    <option>1 - 50</option><option>51 - 200</option><option>201 - 500</option><option>501 - 1,000</option><option>1,000+</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Message</label>
                <textarea placeholder="Tell us about your needs..." rows={4} value={formData.message}
                  onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                  maxLength={2000}
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
              <p className="text-[10px] text-muted-foreground text-center">No obligation, we aim to reply within one business hour.</p>
            </div>
          </motion.div>

          {/* Map + info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col gap-6">
            <div className="glass-premium rounded-3xl overflow-hidden flex-1 min-h-[400px]">
              <iframe
                title="AMEX Outsourcing Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2484.1!2d-0.9500!3d51.4400!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48769b7b9e0a6f0d%3A0x5c8e5f2b1a3d4e6f!2s545+Northumberland+Avenue%2C+Reading+RG2+8NU!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk"
                width="100%" height="100%" style={{ border: 0, minHeight: 400 }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
            <div className="glass-premium rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">AMEX Outsourcing Ltd</p>
                  <p className="text-xs text-muted-foreground">545 Northumberland Avenue, Reading, England, RG2 8NU</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <a href="mailto:info@amexoutsourcing.com" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="w-3.5 h-3.5 text-primary" /> info@amexoutsourcing.com
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}
