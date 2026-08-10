import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, CheckCircle2, ShieldCheck, Users,
  FileText, Headphones, MapPin, Phone, Mail,
  ChevronRight, ChevronDown, Building2, Scale, Briefcase,
  Star, Sparkles, Utensils,
  Hammer, HeartPulse,
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';


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
    { n: '01', icon: Scale, title: 'Employment Status', desc: 'Advice on classifying contractors and employees correctly, helping your organisation align with UK legislation and reduce the risk of misclassification.', tags: ['IR35', 'HMRC', 'Classification'], href: '/services/employment-status' },
    { n: '02', icon: FileText, title: 'Payroll Services', desc: 'Complete payroll handling, from wage calculations and tax deductions to National Insurance, pension contributions and payslip production, delivered accurately and punctually.', tags: ['PAYE', 'NI', 'Pensions'], href: '/services/payroll-services' },
    { n: '03', icon: Briefcase, title: 'HR Services', desc: 'Wide-ranging HR support spanning recruitment, onboarding, performance management, staff engagement and employment law advice.', tags: ['Recruitment', 'Compliance', 'Engagement'], href: '/services/hr-services' },
  ];

  const processSteps = [
    { n: '01', icon: Scale, title: 'Employment Status', desc: 'Work out the appropriate employment classification, with advice on tax, National Insurance, benefits and legal entitlements.' },
    { n: '02', icon: ShieldCheck, title: 'Compliance', desc: 'Continuing compliance assistance to help your organisation keep pace with current laws, regulations and sector standards.' },
    { n: '03', icon: FileText, title: 'Quality Payroll', desc: 'Wage, tax and deduction calculations handled in line with regulatory requirements, freeing you to focus on your core activities.' },
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

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="pt-40 md:pt-56 pb-24 md:pb-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            className="mb-10 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
              Employment Status, Payroll and HR Services
            </span>
            <span className="h-px w-8 bg-primary" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(2.75rem,6.5vw,5.5rem)] font-semibold text-foreground leading-[1.02] tracking-[-0.02em] mb-8">
            Helping your business{' '}
            <span className="text-primary">move forward.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-10">
            Support with employment status, payroll and HR for businesses throughout the UK.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/contact')}
              className="rounded-full h-12 px-8 gap-2 text-sm font-medium">
              Contact Us <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/about')}
              className="rounded-full h-12 px-8 text-sm font-medium border-border hover:border-primary hover:text-primary">
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section className="py-16 md:py-20 border-y border-border/60">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {[
              { to: 5, suffix: '+', label: 'Years in Operation' },
              { to: 90, suffix: '+', label: 'Clients Supported' },
              { to: 1000, suffix: 's', label: 'Payroll Runs Completed' },
              { to: 24, suffix: '/7', label: 'Support Access' },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 0.05} className="text-center">
                <p className="text-3xl md:text-4xl font-semibold text-foreground tabular-nums tracking-tight mb-2">
                  <Counter to={s.to} suffix={s.suffix} />
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────── */}
      <section id="about" className="py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-20">
            <Eyebrow>About Us</Eyebrow>
            <h2 className="text-[clamp(1.875rem,3.5vw,3rem)] font-semibold text-foreground leading-tight tracking-tight mb-6 inline-flex flex-wrap justify-center gap-x-3">
              Meeting your workforce <span className="text-primary">requirements.</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              We collaborate closely with businesses and contractors to offer a compliant, personalised service shaped around your organisation.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-x-10 gap-y-12">
            {[
              { icon: Sparkles, title: 'Tailored Approach', desc: 'A client-centred service shaped around your particular industry and workforce structure.' },
              { icon: Headphones, title: 'Dedicated Support', desc: 'Our team can be reached around the clock whenever you need assistance.' },
              { icon: ShieldCheck, title: 'Compliance Reviews', desc: 'Periodic reviews help keep your organisation in step with regulatory requirements.' },
              { icon: Users, title: 'Workforce Stability', desc: 'HR support aimed at supporting staff retention and productivity.' },
              { icon: Scale, title: 'Employment Law', desc: 'Straightforward advice on recruitment, redundancy and related matters.' },
              { icon: Building2, title: 'Scalable Solutions', desc: 'Support that can grow with you, from your first hire through to a workforce of hundreds.' },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.04}>
                <item.icon className="w-5 h-5 text-primary mb-4" strokeWidth={1.5} />
                <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ────────────────────────────────────────── */}
      <section id="services" className="py-24 md:py-32 border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-20">
            <Eyebrow>What We Do</Eyebrow>
            <h2 className="text-[clamp(1.875rem,3.5vw,3rem)] font-semibold text-foreground leading-tight tracking-tight mb-6">
              Our <span className="text-primary">offering.</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              From assessing employment status through to complete payroll management, we support you at each stage.
            </p>
          </Reveal>

          <div className="divide-y divide-border/60 border-y border-border/60">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <button onClick={() => navigate(s.href)}
                  className="w-full text-left py-10 group grid md:grid-cols-12 gap-6 items-start hover:bg-primary/[0.02] transition-colors px-4 -mx-4">
                  <div className="md:col-span-1 text-xs font-semibold text-primary tracking-widest pt-1">{s.n}</div>
                  <div className="md:col-span-4">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{s.title}</h3>
                  </div>
                  <div className="md:col-span-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                  <div className="md:col-span-1 flex md:justify-end">
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMPLOYMENT STATUS DEEP-DIVE ─────────────────────── */}
      <section className="py-24 md:py-32 border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <Reveal>
              <Eyebrow>Employment Status</Eyebrow>
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-foreground leading-tight tracking-tight mb-6">
                Accurate classification, <span className="text-primary">lower risk.</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                Our team carries out thorough assessments in line with HMRC guidance and IR35 legislation, helping you classify workers appropriately and support compliance with UK employment law.
              </p>
              <Button variant="ghost" onClick={() => navigate('/services/employment-status')}
                className="p-0 h-auto gap-2 text-primary hover:text-primary hover:bg-transparent text-sm font-medium">
                Learn More <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="space-y-4">
                {['IR35 assessments carried out in line with current HMRC guidance', 'Complete worker classification and status determination', 'Documentation and evidence packs prepared for audit purposes', 'Continued regulatory alignment and risk review'].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PAYROLL DEEP-DIVE ──────────────────────────────── */}
      <section className="py-24 md:py-32 border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <Reveal className="order-2 lg:order-1">
              <ul className="space-y-4">
                {['Careful handling of tax, NI and pension deductions', 'Prompt payslip production and delivery', 'Self-billed invoicing and VAT management', 'HMRC RTI submissions with each payroll run'].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1} className="order-1 lg:order-2">
              <Eyebrow>Payroll Services</Eyebrow>
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-foreground leading-tight tracking-tight mb-6">
                Reliable payroll, <span className="text-primary">delivered on time.</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                Complete payroll processing, covering gross pay calculations, deductions, payslip production and HMRC submissions. Whether weekly or monthly, we manage the detail on your behalf.
              </p>
              <Button variant="ghost" onClick={() => navigate('/services/payroll-services')}
                className="p-0 h-auto gap-2 text-primary hover:text-primary hover:bg-transparent text-sm font-medium">
                Learn More <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── HR DEEP-DIVE ──────────────────────────────────── */}
      <section className="py-24 md:py-32 border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <Reveal>
              <Eyebrow>HR Services</Eyebrow>
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-foreground leading-tight tracking-tight mb-6">
                People-centred <span className="text-primary">HR support.</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                Practical, tailored HR support throughout the employee lifecycle, covering recruitment, onboarding, performance and exits, alongside clear employment law advice.
              </p>
              <Button variant="ghost" onClick={() => navigate('/services/hr-services')}
                className="p-0 h-auto gap-2 text-primary hover:text-primary hover:bg-transparent text-sm font-medium">
                Learn More <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="space-y-4">
                {['Support with recruitment and onboarding', 'Performance and absence management', 'Employment law and compliance advice', 'Engagement and workforce planning'].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ─────────────────────────────────────── */}
      <section className="py-24 md:py-32 border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <Eyebrow>Industries</Eyebrow>
            <h2 className="text-[clamp(1.875rem,3.5vw,3rem)] font-semibold text-foreground leading-tight tracking-tight mb-6">
              Sectors we <span className="text-primary">work with.</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Employment and payroll solutions shaped around the practical needs of each sector.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {industries.map((ind, i) => (
              <Reveal key={ind.title} delay={i * 0.06}>
                <button onClick={() => navigate(ind.href)}
                  className="w-full text-left p-8 border border-border/60 group cursor-pointer hover:border-primary/40 transition-colors rounded-xl">
                  <ind.icon className="w-6 h-6 text-primary mb-6" strokeWidth={1.5} />
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{ind.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ─────────────────────────────────────────── */}
      <section id="process" className="py-24 md:py-32 border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-20">
            <Eyebrow>Our Process</Eyebrow>
            <h2 className="text-[clamp(1.875rem,3.5vw,3rem)] font-semibold text-foreground leading-tight tracking-tight mb-6">
              An easy-to-follow <span className="text-primary">three-step</span> approach.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-x-10 gap-y-12">
            {processSteps.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.08}>
                <span className="text-xs font-semibold text-primary tracking-widest">{step.n}</span>
                <h3 className="text-lg font-semibold text-foreground mt-3 mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </Reveal>
            ))}
          </div>

          {/* Testimonial */}
          <Reveal className="mt-24">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-primary fill-primary" />)}
              </div>
              <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6 font-normal">
                "The easy-to-use interface and accessible payroll data have made the whole process clear and straightforward. AMEX has consistently shown professionalism, responsiveness and adaptability."
              </p>
              <p className="text-sm font-medium text-foreground">Jane Jordan</p>
              <p className="text-xs text-muted-foreground">Client</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CONTACT ─────────────────────────────────────────── */}
      <section id="contact" className="py-24 md:py-32 border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <Eyebrow>Contact</Eyebrow>
            <h2 className="text-[clamp(1.875rem,3.5vw,3rem)] font-semibold text-foreground leading-tight tracking-tight mb-6">
              Reach out to <span className="text-primary">us.</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Contact our team to discuss how we can support your organisation.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: MapPin, label: 'Visit', value: '545 Northumberland Avenue, Reading, England, RG2 8NU', href: 'https://maps.google.com/?q=545+Northumberland+Avenue+Reading+England+RG2+8NU' },
              { icon: Phone, label: 'Call', value: '01952 973737', href: 'tel:+01952973737' },
              { icon: Mail, label: 'Email', value: 'info@amexoutsourcing.com', href: 'mailto:info@amexoutsourcing.com' },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 0.06}>
                <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                  className="block text-center p-6 group">
                  <item.icon className="w-5 h-5 text-primary mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">{item.label}</p>
                  <p className="text-sm text-foreground group-hover:text-primary transition-colors leading-relaxed">{item.value}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 border-t border-border/60">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-[clamp(1.875rem,4vw,3rem)] font-semibold text-foreground leading-tight tracking-tight mb-6">
              Help your business <span className="text-primary">move forward.</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed max-w-lg mx-auto mb-8">
              Employment status, payroll and HR support, all provided together.
            </p>
            <Button onClick={() => navigate('/contact')} size="lg"
              className="rounded-full h-12 px-8 gap-2 text-sm font-medium">
              Contact Us <ArrowRight className="w-4 h-4" />
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-border/60 bg-background">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <img src="/logo.png" alt="AMEX Outsourcing" className="h-7 object-contain mb-4" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Employment status, payroll and HR support for businesses across the UK.
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-foreground uppercase tracking-[0.2em] mb-4">Company</p>
              <div className="space-y-2.5">
                {[{ label: 'About', href: '/about' }, { label: 'Process', href: '/process' }, { label: 'Contact', href: '/contact' }].map(l => (
                  <button key={l.label} onClick={() => navigate(l.href)}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-foreground uppercase tracking-[0.2em] mb-4">Services</p>
              <div className="space-y-2.5">
                {serviceLinks.map(s => (
                  <button key={s.label} onClick={() => navigate(s.href)}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-foreground uppercase tracking-[0.2em] mb-4">Portals</p>
              <div className="space-y-2.5">
                <button onClick={() => navigate('/auth/admin')} className="block text-sm text-muted-foreground hover:text-primary transition-colors">Admin Portal</button>
                <button onClick={() => navigate('/auth/client')} className="block text-sm text-muted-foreground hover:text-primary transition-colors">Client Portal</button>
                <button onClick={() => navigate('/auth/candidate')} className="block text-sm text-muted-foreground hover:text-primary transition-colors">Candidate Portal</button>
              </div>
            </div>
          </div>

          <div className="border-t border-border/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-1 md:gap-5 text-xs text-muted-foreground text-center">
              <span>© {new Date().getFullYear()} AMEX Outsourcing Ltd.</span>
              <span className="text-muted-foreground/70">Powered by Oak Technologies</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
