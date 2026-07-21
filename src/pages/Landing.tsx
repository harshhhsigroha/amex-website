import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, CheckCircle2, ShieldCheck, Clock, Users,
  FileText, BarChart3, Headphones, MapPin, Phone, Mail,
  ChevronRight, ChevronDown, Building2, Scale, Briefcase,
  Shield, Star, TrendingUp, Sparkles, Utensils,
  Hammer, HeartPulse, UserCircle2,
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

import aboutConsultantImg from '@/assets/about-consultant.jpg';
import ctaHandshakeImg from '@/assets/cta-handshake.jpg';

/* ── Reveal ──────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>{children}</motion.div>
  );
}

/* ── Counter ─────────────────────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !triggered.current) {
        triggered.current = true;
        const dur = 1800;
        const step = (ts: number, s: number) => {
          const p = Math.min((ts - s) / dur, 1);
          setCount(Math.floor((1 - Math.pow(1 - p, 3)) * to));
          if (p < 1) requestAnimationFrame(t => step(t, s));
        };
        requestAnimationFrame(t => step(t, t));
      }
    }, { threshold: 0.5 });
    ob.observe(el);
    return () => ob.disconnect();
  }, [to]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Eyebrow rule ────────────────────────────────────────── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="h-px w-10 bg-primary" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
        {children}
      </span>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [industriesDropdownOpen, setIndustriesDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileIndustriesOpen, setMobileIndustriesOpen] = useState(false);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const industriesDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(e.target as Node)) {
        setServicesDropdownOpen(false);
      }
      if (industriesDropdownRef.current && !industriesDropdownRef.current.contains(e.target as Node)) {
        setIndustriesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const serviceLinks = [
    { icon: Scale, label: 'Employment Status', href: '/services/employment-status' },
    { icon: FileText, label: 'Payroll Services', href: '/services/payroll-services' },
    { icon: Briefcase, label: 'HR Services', href: '/services/hr-services' },
  ];

  const industryLinks = [
    { icon: Hammer, label: 'Construction', href: '/industries/construction' },
    { icon: HeartPulse, label: 'Healthcare', href: '/industries/healthcare' },
    { icon: Utensils, label: 'Hospitality', href: '/industries/hospitality' },
  ];

  const services = [
    { n: '01', icon: Scale, title: 'Employment Status', desc: 'Guidance on employment classification for contractors and employees, supporting compliance with UK legislation and helping to mitigate the risk of reclassification.', tags: ['IR35', 'HMRC', 'Classification'], href: '/services/employment-status' },
    { n: '02', icon: FileText, title: 'Payroll Services', desc: 'End-to-end payroll management including wage calculations, tax deductions, National Insurance, pension contributions, and payslip generation — accurate and on time.', tags: ['PAYE', 'NI', 'Pensions'], href: '/services/payroll-services' },
    { n: '03', icon: Briefcase, title: 'HR Services', desc: 'Comprehensive human resources support covering recruitment, onboarding, performance management, employee engagement, and employment law guidance.', tags: ['Recruitment', 'Compliance', 'Engagement'], href: '/services/hr-services' },
  ];

  const processSteps = [
    { n: '01', icon: Scale, title: 'Employment Status', desc: 'Determine correct employment classification with guidance on tax, National Insurance, benefits, and legal rights.' },
    { n: '02', icon: ShieldCheck, title: 'Compliance', desc: 'Ongoing compliance support to help your organisation follow the latest laws, regulations, and industry standards.' },
    { n: '03', icon: FileText, title: 'Quality Payroll', desc: 'Calculating wages, taxes, and deductions with full regulatory compliance, so you can focus on core activities.' },
  ];

  const industries = [
    { icon: Hammer, title: 'Construction', href: '/industries/construction' },
    { icon: HeartPulse, title: 'Healthcare', href: '/industries/healthcare' },
    { icon: Utensils, title: 'Hospitality', href: '/industries/hospitality' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden font-sans text-foreground">

      {/* ── NAV ─────────────────────────────────────────────── */}
      <motion.nav initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="AMEX Outsourcing" className="h-8 object-contain" />
          </a>
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => navigate('/about')}
              className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </button>
            <div ref={servicesDropdownRef} className="relative">
              <button onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                Services <ChevronDown className={`w-3 h-3 transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {servicesDropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                    <div className="py-2">
                      {serviceLinks.map(s => (
                        <button key={s.label} onClick={() => { setServicesDropdownOpen(false); navigate(s.href); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                          <s.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => navigate('/process')}
              className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              Process
            </button>
            <button onClick={() => navigate('/contact')}
              className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </button>
            <div ref={industriesDropdownRef} className="relative">
              <button onClick={() => setIndustriesDropdownOpen(!industriesDropdownOpen)}
                className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                Industries <ChevronDown className={`w-3 h-3 transition-transform ${industriesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {industriesDropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                    <div className="py-2">
                      {industryLinks.map(s => (
                        <button key={s.label} onClick={() => { setIndustriesDropdownOpen(false); navigate(s.href); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                          <s.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth/admin')} className="hidden sm:flex text-muted-foreground text-[13px]">
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate('/contact')} className="rounded-none px-5 gap-1.5 text-[13px]">
              Contact Us <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden ml-1 p-2 rounded-md hover:bg-accent transition-colors">
              <div className="flex flex-col gap-1.5 w-5">
                <motion.span animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} className="h-px bg-foreground block origin-center" />
                <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} className="h-px bg-foreground block" />
                <motion.span animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} className="h-px bg-foreground block origin-center" />
              </div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="md:hidden fixed top-16 left-0 right-0 z-40 bg-background border-b border-border overflow-hidden shadow-lg">
            <div className="px-4 py-4 flex flex-col gap-1">
              <button onClick={() => { setMenuOpen(false); navigate('/about'); }}
                className="flex items-center justify-between w-full px-4 py-3.5 text-base font-medium text-foreground hover:text-primary hover:bg-accent transition-colors">
                About<ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </button>
              <button onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="flex items-center justify-between w-full px-4 py-3.5 text-base font-medium text-foreground hover:text-primary hover:bg-accent transition-colors">
                Services<ChevronDown className={`w-4 h-4 text-muted-foreground/50 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {mobileServicesOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="pl-4 space-y-0.5">
                      {serviceLinks.map(s => (
                        <button key={s.label} onClick={() => { setMenuOpen(false); setMobileServicesOpen(false); navigate(s.href); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                          <s.icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <button onClick={() => { setMenuOpen(false); navigate('/process'); }}
                className="flex items-center justify-between w-full px-4 py-3.5 text-base font-medium text-foreground hover:text-primary hover:bg-accent transition-colors">
                Process<ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </button>
              <button onClick={() => { setMenuOpen(false); navigate('/contact'); }}
                className="flex items-center justify-between w-full px-4 py-3.5 text-base font-medium text-foreground hover:text-primary hover:bg-accent transition-colors">
                Contact<ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </button>
              <button onClick={() => setMobileIndustriesOpen(!mobileIndustriesOpen)}
                className="flex items-center justify-between w-full px-4 py-3.5 text-base font-medium text-foreground hover:text-primary hover:bg-accent transition-colors">
                Industries<ChevronDown className={`w-4 h-4 text-muted-foreground/50 transition-transform ${mobileIndustriesOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {mobileIndustriesOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="pl-4 space-y-0.5">
                      {industryLinks.map(s => (
                        <button key={s.label} onClick={() => { setMenuOpen(false); setMobileIndustriesOpen(false); navigate(s.href); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                          <s.icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="h-px bg-border my-2" />
              {[
                { label: 'Admin Portal', route: '/auth/admin' },
                { label: 'Client Portal', route: '/auth/client' },
                { label: 'Candidate Portal', route: '/auth/candidate' },
              ].map(item => (
                <button key={item.label} onClick={() => { setMenuOpen(false); navigate(item.route); }}
                  className="flex items-center justify-between w-full px-4 py-3.5 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  {item.label}<ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO — Editorial split ─────────────────────────── */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-28 border-b border-border">
        <div className="absolute top-16 right-0 w-1/2 h-full bg-primary/[0.03] pointer-events-none hidden md:block" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

            {/* Left: headline */}
            <div className="lg:col-span-8">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Eyebrow>Employment Status · Payroll · HR</Eyebrow>
              </motion.div>

              <div className="overflow-hidden">
                <motion.h1 initial={{ y: '110%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[clamp(3rem,8vw,7.5rem)] font-bold leading-[0.92] tracking-[-0.03em] text-foreground">
                  Take your<br />business
                </motion.h1>
              </div>
              <div className="overflow-hidden">
                <motion.h1 initial={{ y: '110%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[clamp(3rem,8vw,7.5rem)] font-bold leading-[0.92] tracking-[-0.03em] text-primary">
                  further.
                </motion.h1>
              </div>
            </div>

            {/* Right: description + CTAs */}
            <div className="lg:col-span-4 flex flex-col justify-end lg:pl-8 lg:border-l lg:border-border">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
                  Employment status, payroll management, and HR support for businesses across the UK — ensuring compliance and taking care of your workforce.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  <Button size="lg" onClick={() => navigate('/contact')}
                    className="rounded-none h-12 px-7 gap-2 text-[13px] uppercase tracking-widest font-semibold">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/about')}
                    className="rounded-none h-12 px-7 text-[13px] uppercase tracking-widest font-semibold border-foreground/20 hover:border-primary hover:text-primary">
                    Learn More
                  </Button>
                </div>

                <div className="pt-8 border-t border-border grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-2xl font-bold text-foreground tabular-nums"><Counter to={90} suffix="+" /></p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">Clients across the UK</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary tabular-nums"><Counter to={99} suffix="%" /></p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">Client retention</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Trust strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="mt-20 pt-10 border-t border-border flex flex-wrap gap-x-10 gap-y-4">
            {[
              { icon: ShieldCheck, label: 'HMRC Compliant' },
              { icon: Users, label: 'UK-Wide Service' },
              { icon: Clock, label: '24/7 Support' },
              { icon: Star, label: 'Dedicated Account Managers' },
            ].map(({ icon: Ic, label }) => (
              <div key={label} className="flex items-center gap-2 text-[12px] text-muted-foreground uppercase tracking-widest">
                <Ic className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────── */}
      <section className="border-b border-border bg-background">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {[
              { to: 5, suffix: '+', label: 'Years Experience', sub: 'in the industry' },
              { to: 90, suffix: '+', label: 'Clients Served', sub: 'across the UK' },
              { to: 1000, suffix: 's', label: 'Payrolls Processed', sub: 'accurately and on time' },
              { to: 24, suffix: '/7', label: 'Support Available', sub: 'whenever you need us' },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06}
                className="px-6 py-14 md:py-16 first:pl-0">
                <p className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-foreground leading-none mb-3 tabular-nums tracking-tight">
                  <Counter to={s.to} suffix={s.suffix} />
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground mb-1">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────── */}
      <section id="about" className="py-24 md:py-32 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-20">
            <Reveal className="lg:col-span-5">
              <div className="overflow-hidden">
                <img src={aboutConsultantImg} alt="Business consultant reviewing documents"
                  className="w-full h-[420px] object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  loading="lazy" width={800} height={960} />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <Eyebrow>About Us</Eyebrow>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-foreground leading-[1.05] tracking-tight mb-6">
                Supporting your workforce <span className="text-primary">needs.</span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl">
                We work closely with businesses and contractors to provide a compliant and personalised service. Our approach is tailored to each client, ensuring you receive the support that suits your organisation.
              </p>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 border-t border-l border-border">
            {[
              { icon: Sparkles, title: 'Tailored Approach', desc: 'A compliant and client-focused service designed around your specific industry requirements and workforce structure.' },
              { icon: Headphones, title: 'Dedicated Support', desc: 'Our support team is available around the clock, ensuring you have access to assistance whenever you need it.' },
              { icon: ShieldCheck, title: 'Compliance Reviews', desc: 'Regular compliance reviews conducted quarterly, helping to keep your organisation aligned with regulatory requirements.' },
              { icon: Users, title: 'Workforce Stability', desc: 'Our HR support is designed to help improve employee retention, contributing to a more stable and productive workforce.' },
              { icon: Scale, title: 'Employment Law Guidance', desc: 'We provide guidance on employment law matters, helping you navigate recruitment, redundancy, and related challenges.' },
              { icon: Building2, title: 'Scalable Solutions', desc: 'Whether you are hiring your first team member or managing a large workforce, we offer solutions that scale with your needs.' },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.05}
                className="border-r border-b border-border p-8 group hover:bg-primary/[0.02] transition-colors">
                <item.icon className="w-6 h-6 text-primary mb-5" strokeWidth={1.5} />
                <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ────────────────────────────────────────── */}
      <section id="services" className="py-24 md:py-32 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Reveal className="grid lg:grid-cols-12 gap-8 mb-16">
            <div className="lg:col-span-5">
              <Eyebrow>What We Do</Eyebrow>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-foreground leading-[1.05] tracking-tight">
                Our <span className="text-primary">services.</span>
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                From employment status determination to full payroll management and beyond — we are here to support you at every stage.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 border-t border-l border-border">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <div onClick={() => navigate(s.href)}
                  className="border-r border-b border-border p-8 md:p-10 h-full group cursor-pointer hover:bg-primary/[0.03] transition-colors relative">
                  <div className="flex items-start justify-between mb-8">
                    <span className="text-xs font-bold text-primary tracking-widest">{s.n}</span>
                    <s.icon className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{s.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {s.tags.map(t => (
                      <span key={t} className="text-[10px] font-semibold text-muted-foreground border border-border px-2.5 py-1 uppercase tracking-widest">{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-foreground uppercase tracking-widest group-hover:text-primary transition-colors">
                    Learn More <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMPLOYMENT STATUS DEEP-DIVE ─────────────────────── */}
      <section className="py-24 md:py-32 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <Reveal>
              <Eyebrow>Employment Status</Eyebrow>
              <h2 className="text-[clamp(1.75rem,3.2vw,2.75rem)] font-bold text-foreground leading-[1.1] tracking-tight mb-6">
                Correct classification,<br /><span className="text-primary">reduced risk.</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5">
                Understanding your employment status is essential for determining tax obligations, National Insurance contributions, benefits entitlements, and legal rights. Whether you engage self-employed contractors, agency workers, or PAYE employees, correct classification protects both your organisation and your workforce.
              </p>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
                Our team provides detailed assessments aligned with HMRC guidelines and IR35 legislation, helping you to classify workers correctly and maintain full compliance with UK employment law.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {['IR35 assessments', 'HMRC compliance', 'Worker classification', 'Audit-ready documentation'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" strokeWidth={2} /> {item}
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="border border-border p-8 md:p-10 divide-y divide-border">
                {[
                  { icon: Scale, title: 'Status Determination', desc: 'We assess each engagement individually, considering the nature of the working relationship, control, and financial arrangements.' },
                  { icon: ShieldCheck, title: 'Regulatory Alignment', desc: 'Our assessments follow current HMRC guidance, helping to reduce the risk of reclassification, back taxes, or penalties.' },
                  { icon: FileText, title: 'Full Documentation', desc: 'We provide comprehensive reports and supporting evidence, so your organisation is prepared for any compliance review.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-5 py-5 first:pt-0 last:pb-0">
                    <item.icon className="w-6 h-6 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-1.5">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-6">
                  <Button variant="outline" onClick={() => navigate('/services/employment-status')}
                    className="w-full rounded-none h-11 gap-2 text-[12px] uppercase tracking-widest font-semibold border-foreground/20 hover:border-primary hover:text-primary">
                    Learn More <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PAYROLL DEEP-DIVE ──────────────────────────────── */}
      <section className="py-24 md:py-32 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <Reveal className="order-2 lg:order-1">
              <div className="border border-border p-8 md:p-10 divide-y divide-border">
                {[
                  { icon: FileText, title: 'Wage & Deductions', desc: 'Accurate calculation of wages, income tax, National Insurance, pension contributions, and any applicable levies — fully itemised on every payslip.' },
                  { icon: BarChart3, title: 'Invoice Management', desc: 'Once timesheets are approved, we generate and submit invoices on your behalf, providing clear breakdowns and following up on payments.' },
                  { icon: Shield, title: 'HMRC Submissions', desc: 'All payroll data is submitted to HMRC in accordance with Real Time Information (RTI) requirements, keeping you compliant at every stage.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-5 py-5 first:pt-0 last:pb-0">
                    <item.icon className="w-6 h-6 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-1.5">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-6">
                  <Button variant="outline" onClick={() => navigate('/services/payroll-services')}
                    className="w-full rounded-none h-11 gap-2 text-[12px] uppercase tracking-widest font-semibold border-foreground/20 hover:border-primary hover:text-primary">
                    Learn More <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="order-1 lg:order-2">
              <Eyebrow>Payroll Services</Eyebrow>
              <h2 className="text-[clamp(1.75rem,3.2vw,2.75rem)] font-bold text-foreground leading-[1.1] tracking-tight mb-6">
                Accurate payroll,<br /><span className="text-primary">on time.</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5">
                We manage end-to-end payroll processing, ensuring your workforce is paid correctly and promptly. Our service covers everything from calculating gross pay and deductions to generating payslips and submitting returns to HMRC.
              </p>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
                Whether your contractors are on weekly or monthly schedules, our streamlined system handles the complexity — including self-billed invoicing, VAT calculations, and detailed payment breakdowns.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {['Tax & NI deductions', 'Pension contributions', 'Payslip generation', 'Self-billed invoices'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" strokeWidth={2} /> {item}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── HR DEEP-DIVE ──────────────────────────────────── */}
      <section className="py-24 md:py-32 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <Reveal>
              <Eyebrow>HR Services</Eyebrow>
              <h2 className="text-[clamp(1.75rem,3.2vw,2.75rem)] font-bold text-foreground leading-[1.1] tracking-tight mb-6">
                People-focused<br /><span className="text-primary">HR support.</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5">
                Whether you are preparing to hire your first employee or managing a workforce of several hundred, our HR team provides practical, tailored support. We cover the full spectrum — from recruitment and onboarding through to performance management and exit processes.
              </p>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
                We help you navigate the complexities of employment law, resolve sensitive workplace issues, address absenteeism, and build a positive culture that supports retention.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {['Recruitment support', 'Performance management', 'Absence management', 'Employment law guidance'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" strokeWidth={2} /> {item}
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="border border-border p-8 md:p-10 divide-y divide-border">
                {[
                  { icon: Users, title: 'Employee Engagement', desc: 'We help you develop strategies to improve workplace satisfaction and build a culture that attracts and retains talent.' },
                  { icon: Briefcase, title: 'Legal Compliance', desc: 'Guidance on your responsibilities as an employer, covering disciplinary procedures, grievance handling, and redundancy processes.' },
                  { icon: TrendingUp, title: 'Workforce Planning', desc: 'Support with organisational design, succession planning, and workforce restructuring to meet your evolving business needs.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-5 py-5 first:pt-0 last:pb-0">
                    <item.icon className="w-6 h-6 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-1.5">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-6">
                  <Button variant="outline" onClick={() => navigate('/services/hr-services')}
                    className="w-full rounded-none h-11 gap-2 text-[12px] uppercase tracking-widest font-semibold border-foreground/20 hover:border-primary hover:text-primary">
                    Learn More <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ─────────────────────────────────────── */}
      <section className="py-24 md:py-32 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Reveal className="grid lg:grid-cols-12 gap-8 mb-16">
            <div className="lg:col-span-5">
              <Eyebrow>Industries</Eyebrow>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-foreground leading-[1.05] tracking-tight">
                Sectors we <span className="text-primary">support.</span>
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                We work with organisations across a wide range of industries, providing tailored employment and payroll solutions built for the realities of each sector.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 border-t border-l border-border">
            {industries.map((ind, i) => (
              <Reveal key={ind.title} delay={i * 0.06}>
                <div onClick={() => navigate(ind.href)}
                  className="border-r border-b border-border p-10 md:p-12 group cursor-pointer hover:bg-primary/[0.03] transition-colors">
                  <ind.icon className="w-8 h-8 text-primary mb-6" strokeWidth={1.5} />
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{ind.title}</h3>
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">
                    Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ─────────────────────────────────────────── */}
      <section id="process" className="py-24 md:py-32 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Reveal className="grid lg:grid-cols-12 gap-8 mb-16">
            <div className="lg:col-span-5">
              <Eyebrow>Our Process</Eyebrow>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-foreground leading-[1.05] tracking-tight">
                Employment Status,<br />Payroll & <span className="text-primary">HR.</span>
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                A streamlined three-step approach designed to support compliance, accuracy, and peace of mind at every stage.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-px bg-border border border-border mb-20">
            {processSteps.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.1}>
                <div className="bg-background p-8 md:p-10 h-full group hover:bg-primary/[0.03] transition-colors">
                  <div className="flex items-start justify-between mb-8">
                    <span className="text-7xl font-bold text-primary/15 leading-none tracking-tight">{step.n}</span>
                    <step.icon className="w-6 h-6 text-primary mt-2" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Testimonial */}
          <Reveal>
            <div className="border border-border p-10 md:p-16 max-w-4xl mx-auto">
              <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-primary fill-primary" />)}
              </div>
              <p className="text-xl md:text-2xl text-foreground leading-relaxed mb-8 font-medium tracking-tight">
                "The user-friendly interface and accessibility of payroll-related data have made the entire process transparent and hassle-free. AMEX has consistently demonstrated a high level of professionalism, responsiveness, and adaptability to our specific needs."
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">JJ</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Jane Jordan</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Client</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CONTACT ─────────────────────────────────────────── */}
      <section id="contact" className="py-24 md:py-32 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Reveal className="grid lg:grid-cols-12 gap-8 mb-16">
            <div className="lg:col-span-5">
              <Eyebrow>Contact</Eyebrow>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-foreground leading-[1.05] tracking-tight">
                Get in <span className="text-primary">touch.</span>
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                Speak to our team about how we can support your organisation with employment status, payroll, and HR services.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 border-t border-l border-border mb-12">
            {[
              { icon: MapPin, label: 'Visit Us', value: 'Pemberton House, Stafford Park 1, TF3 3BD', href: 'https://maps.google.com/?q=Pemberton+House+Stafford+Park+1+TF3+3BD' },
              { icon: Phone, label: 'Call Us', value: '01952 973737', href: 'tel:+01952973737' },
              { icon: Mail, label: 'Email Us', value: 'info@amexoutsourcing.com', href: 'mailto:info@amexoutsourcing.com' },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 0.08}>
                <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                  className="border-r border-b border-border p-8 md:p-10 block h-full group hover:bg-primary/[0.03] transition-colors">
                  <item.icon className="w-6 h-6 text-primary mb-6" strokeWidth={1.5} />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">{item.label}</p>
                  <p className="text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">{item.value}</p>
                </a>
              </Reveal>
            ))}
          </div>

          <Reveal className="text-center">
            <Button size="lg" onClick={() => window.location.href = 'tel:+01952973737'}
              className="rounded-none px-10 h-12 gap-2 text-[13px] uppercase tracking-widest font-semibold">
              <Phone className="w-4 h-4" /> Call Us Now
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 md:py-20">
          <div className="relative overflow-hidden border border-border">
            <img src={ctaHandshakeImg} alt="Business partnership"
              className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"
              loading="lazy" width={1280} height={640} />
            <div className="relative px-8 md:px-16 py-16 md:py-24 grid lg:grid-cols-12 gap-8 items-end bg-background/60 backdrop-blur-sm">
              <Reveal className="lg:col-span-8">
                <Eyebrow>Ready?</Eyebrow>
                <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold text-foreground leading-[1.02] tracking-tight">
                  Take your business<br /><span className="text-primary">further.</span>
                </h2>
                <p className="text-muted-foreground max-w-lg text-base md:text-lg leading-relaxed mt-6">
                  Employment status, payroll, and HR services — all under one roof. Let us handle the complexity so you can focus on growth.
                </p>
              </Reveal>
              <Reveal delay={0.1} className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
                <Button onClick={() => navigate('/contact')} size="lg"
                  className="rounded-none px-8 h-12 gap-2 w-full text-[13px] uppercase tracking-widest font-semibold">
                  Get in Touch <ArrowRight className="w-4 h-4" />
                </Button>
                <Button onClick={() => navigate('/about')} variant="outline" size="lg"
                  className="rounded-none px-8 h-12 gap-2 w-full text-[13px] uppercase tracking-widest font-semibold border-foreground/20 hover:border-primary hover:text-primary">
                  Learn More
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="bg-background">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <img src="/logo.png" alt="AMEX Outsourcing" className="h-8 object-contain mb-5" />
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Employment status, payroll, HR, and compliance services for businesses across the UK.
              </p>
              <p className="text-xs text-muted-foreground">
                Pemberton House, Stafford Park 1, TF3 3BD
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-foreground uppercase tracking-[0.2em] mb-5">Quick Links</p>
              <div className="space-y-3">
                {[{ label: 'About', href: '/about' }, { label: 'Process', href: '/process' }, { label: 'Contact', href: '/contact' }].map(l => (
                  <button key={l.label} onClick={() => navigate(l.href)}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-foreground uppercase tracking-[0.2em] mb-5">Services</p>
              <div className="space-y-3">
                {serviceLinks.map(s => (
                  <button key={s.label} onClick={() => navigate(s.href)}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-foreground uppercase tracking-[0.2em] mb-5">Portal Login</p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/auth/admin')}
                  className="w-full justify-start gap-2 rounded-none text-sm border-border hover:border-primary hover:text-primary">
                  <Building2 className="w-4 h-4 text-primary" /> Admin Portal
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/auth/client')}
                  className="w-full justify-start gap-2 rounded-none text-sm border-border hover:border-primary hover:text-primary">
                  <Users className="w-4 h-4 text-primary" /> Client Portal
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/auth/candidate')}
                  className="w-full justify-start gap-2 rounded-none text-sm border-border hover:border-primary hover:text-primary">
                  <UserCircle2 className="w-4 h-4 text-primary" /> Candidate Portal
                </Button>
              </div>
              <div className="mt-5 space-y-2">
                <a href="tel:+01952973737" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="w-3.5 h-3.5" /> 01952 973737
                </a>
                <a href="mailto:info@amexoutsourcing.com" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="w-3.5 h-3.5" /> info@amexoutsourcing.com
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-xs text-muted-foreground text-center md:text-right">
              <span>© {new Date().getFullYear()} AMEX Outsourcing Ltd. All Rights Reserved.</span>
              <span className="text-muted-foreground/60">Powered by Oak Technologies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
