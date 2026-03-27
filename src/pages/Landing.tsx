import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, CheckCircle2, ShieldCheck, Clock, Users,
  FileText, BarChart3, Headphones, MapPin, Phone, Mail,
  ChevronRight, ChevronDown, Building2, Scale, Briefcase, ClipboardCheck,
  Shield, Star, TrendingUp, Sparkles, Factory, Truck, Utensils,
  Hammer, HeartPulse, GraduationCap, Landmark, ShoppingCart,
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import heroTeamImg from '@/assets/hero-team.jpg';
import aboutConsultantImg from '@/assets/about-consultant.jpg';
import ctaHandshakeImg from '@/assets/cta-handshake.jpg';

/* ── Scroll direction ─────────────────────────────────────── */
function useScrollDirection() {
  const [dir, setDir] = useState<'down' | 'up'>('down');
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const curr = window.scrollY;
      if (Math.abs(curr - last) > 4) { setDir(curr > last ? 'down' : 'up'); last = curr; }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return dir;
}

/* ── Reveal ────────────────────────────────────────────────── */
const revealVariants = {
  hidden: (c: { scrollDir: 'down' | 'up'; axis: 'y' | 'left' | 'right' }) => {
    if (c.axis === 'left') return { opacity: 0, x: c.scrollDir === 'down' ? -48 : 48, y: 0 };
    if (c.axis === 'right') return { opacity: 0, x: c.scrollDir === 'down' ? 48 : -48, y: 0 };
    return { opacity: 0, x: 0, y: c.scrollDir === 'down' ? 36 : -36 };
  },
  visible: { opacity: 1, x: 0, y: 0 },
};

function Reveal({ children, delay = 0, axis = 'y' as const, className = '' }: {
  children: React.ReactNode; delay?: number; axis?: 'y' | 'left' | 'right'; className?: string;
}) {
  const scrollDir = useScrollDirection();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} custom={{ scrollDir, axis }} variants={revealVariants}
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>{children}</motion.div>
  );
}

/* ── Counter ───────────────────────────────────────────────── */
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

/* ── Accent ────────────────────────────────────────────────── */
function Accent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-gradient ${className}`}>{children}</span>;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
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

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

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
    { icon: Scale, title: 'Employment Status', desc: 'Guidance on employment classification for contractors and employees, supporting compliance with UK legislation and helping to mitigate the risk of reclassification.', tags: ['IR35', 'HMRC', 'Classification'], href: '/services/employment-status' },
    { icon: FileText, title: 'Payroll Services', desc: 'End-to-end payroll management including wage calculations, tax deductions, National Insurance, pension contributions, and payslip generation — accurate and on time.', tags: ['PAYE', 'NI', 'Pensions'], href: '/services/payroll-services' },
    { icon: Briefcase, title: 'HR Services', desc: 'Comprehensive human resources support covering recruitment, onboarding, performance management, employee engagement, and employment law guidance.', tags: ['Recruitment', 'Compliance', 'Engagement'], href: '/services/hr-services' },
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
    <div className="min-h-screen bg-background overflow-x-hidden font-sans">

      {/* ── NAV ─────────────────────────────────────────────── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-4 left-4 right-4 z-50 glass-premium rounded-2xl shadow-lg">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="AMEX Outsourcing" className="h-8 object-contain" />
          </a>
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => navigate('/about')}
              className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/60">
              About
            </button>
            <div ref={servicesDropdownRef} className="relative">
              <button onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/60 flex items-center gap-1">
                Services <ChevronDown className={`w-3 h-3 transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {servicesDropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-64 glass-premium rounded-xl shadow-lg overflow-hidden">
                    <div className="py-2">
                      {serviceLinks.map(s => (
                        <button key={s.label} onClick={() => { setServicesDropdownOpen(false); navigate(s.href); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
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
              className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/60">
              Process
            </button>
            <button onClick={() => navigate('/contact')}
              className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/60">
              Contact
            </button>
            <div ref={industriesDropdownRef} className="relative">
              <button onClick={() => setIndustriesDropdownOpen(!industriesDropdownOpen)}
                className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/60 flex items-center gap-1">
                Industries <ChevronDown className={`w-3 h-3 transition-transform ${industriesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {industriesDropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-56 glass-premium rounded-xl shadow-lg overflow-hidden">
                    <div className="py-2">
                      {industryLinks.map(s => (
                        <button key={s.label} onClick={() => { setIndustriesDropdownOpen(false); navigate(s.href); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth/client')} className="hidden sm:flex text-muted-foreground text-[13px]">
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate('/contact')} className="rounded-full px-5 gap-1.5 text-[13px] shadow-lg shadow-primary/20">
              Contact Us <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden ml-1 p-2 rounded-lg hover:bg-accent/60 transition-colors">
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
            className="md:hidden fixed top-[4.5rem] left-4 right-4 z-40 glass-premium rounded-2xl overflow-hidden shadow-lg">
            <div className="px-4 py-4 flex flex-col gap-1">
              <motion.button initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                onClick={() => { setMenuOpen(false); navigate('/about'); }}
                className="flex items-center justify-between w-full px-4 py-3.5 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                About<ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </motion.button>
              <motion.button initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="flex items-center justify-between w-full px-4 py-3.5 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                Services<ChevronDown className={`w-4 h-4 text-muted-foreground/50 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
              </motion.button>
              <AnimatePresence>
                {mobileServicesOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="pl-4 space-y-0.5">
                      {serviceLinks.map(s => (
                        <button key={s.label} onClick={() => { setMenuOpen(false); setMobileServicesOpen(false); navigate(s.href); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-xl transition-colors">
                          <s.icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }} onClick={() => { setMenuOpen(false); navigate('/process'); }}
                className="flex items-center justify-between w-full px-4 py-3.5 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                Process<ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </motion.button>
              <motion.button initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }} onClick={() => { setMenuOpen(false); navigate('/contact'); }}
                className="flex items-center justify-between w-full px-4 py-3.5 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                Contact<ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </motion.button>
              <motion.button initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setMobileIndustriesOpen(!mobileIndustriesOpen)}
                className="flex items-center justify-between w-full px-4 py-3.5 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                Industries<ChevronDown className={`w-4 h-4 text-muted-foreground/50 transition-transform ${mobileIndustriesOpen ? 'rotate-180' : ''}`} />
              </motion.button>
              <AnimatePresence>
                {mobileIndustriesOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="pl-4 space-y-0.5">
                      {industryLinks.map(s => (
                        <button key={s.label} onClick={() => { setMenuOpen(false); setMobileIndustriesOpen(false); navigate(s.href); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-xl transition-colors">
                          <s.icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="h-px bg-border/40 my-2" />
              {[
                { label: 'Admin Login', route: '/auth/client' },
                { label: 'Client Login', route: '/auth/portal' },
              ].map((item, i) => (
                <motion.button key={item.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  onClick={() => { setMenuOpen(false); navigate(item.route); }}
                  className="flex items-center justify-between w-full px-4 py-3.5 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-xl transition-colors">
                  {item.label}<ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[100vh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-background" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-5xl mx-auto px-6 pt-40 pb-32 w-full relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }} className="mb-8">
            <span className="inline-flex items-center gap-2.5 text-[11px] font-medium text-primary glass-premium px-5 py-2.5 rounded-full uppercase tracking-[0.14em]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Employment Status · Payroll · HR
            </span>
          </motion.div>

          <div className="mb-8">
            <div className="overflow-hidden">
              <motion.h1 initial={{ y: '110%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-[clamp(3rem,7vw,5.5rem)] font-semibold tracking-tight leading-[1] text-foreground">
                Take your business
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1 initial={{ y: '110%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="text-[clamp(3rem,7vw,5.5rem)] tracking-tight leading-[1]">
                <Accent>further.</Accent>
              </motion.h1>
            </div>
          </div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg mb-10">
            Employment status, payroll management, and HR support for businesses across the UK — ensuring compliance and taking care of your workforce.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.72 }}
            className="flex flex-col sm:flex-row justify-center gap-3 mb-16">
            <Button size="lg" onClick={() => navigate('/contact')}
              className="rounded-full px-10 h-[3.25rem] shadow-xl shadow-primary/25 gap-2.5 text-[15px] font-medium">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/about')}
              className="rounded-full px-10 h-[3.25rem] text-[15px]">
              Learn More
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-center gap-x-10 gap-y-3">
            {[
              { icon: ShieldCheck, label: 'HMRC Compliant' },
              { icon: Users, label: 'UK-Wide Service' },
              { icon: Clock, label: '24/7 Support' },
              { icon: Star, label: 'Dedicated Account Managers' },
            ].map(({ icon: Ic, label }) => (
              <div key={label} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <Ic className="w-3.5 h-3.5 text-primary/60" strokeWidth={1.5} />
                {label}
              </div>
            ))}
          </motion.div>
        </motion.div>


        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border-2 border-primary/30 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-primary/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────── */}
      <section className="py-0 border-y border-border/20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { to: 5, suffix: '+', label: 'Years Experience', sub: 'in the industry' },
              { to: 90, suffix: '+', label: 'Clients Served', sub: 'across the UK' },
              { to: 1000, suffix: 's', label: 'Payrolls Processed', sub: 'accurately and on time' },
              { to: 24, suffix: '/7', label: 'Support Available', sub: 'whenever you need us' },
            ].map((s, i) => (
              <Reveal key={s.label} axis={i < 2 ? 'left' : 'right'} delay={i * 0.06}
                className="px-6 py-16 md:py-20 text-center border-r border-border/20 last:border-r-0">
                <p className="text-[clamp(3rem,7vw,5rem)] font-medium text-foreground leading-none mb-3 tabular-nums tracking-tight">
                  <Counter to={s.to} suffix={s.suffix} />
                </p>
                <p className="text-sm font-medium text-foreground mb-0.5">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────── */}
      <section id="about" className="py-32 px-6 bg-background relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <Reveal axis="left">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img src={aboutConsultantImg} alt="Business consultant reviewing documents" className="w-full h-80 object-cover" loading="lazy" width={800} height={960} />
              </div>
            </Reveal>
            <Reveal axis="right">
              <p className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] mb-4">About Us</p>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
                Supporting your<br />workforce <Accent>needs.</Accent>
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                We work closely with businesses and contractors to provide a compliant and personalised service. Our approach is tailored to each client, ensuring you receive the support that suits your organisation.
              </p>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Sparkles, title: 'Tailored Approach', desc: 'A compliant and client-focused service designed around your specific industry requirements and workforce structure.' },
              { icon: Headphones, title: 'Dedicated Support', desc: 'Our support team is available around the clock, ensuring you have access to assistance whenever you need it.' },
              { icon: ShieldCheck, title: 'Compliance Reviews', desc: 'Regular compliance reviews conducted quarterly, helping to keep your organisation aligned with regulatory requirements.' },
              { icon: Users, title: 'Workforce Stability', desc: 'Our HR support is designed to help improve employee retention, contributing to a more stable and productive workforce.' },
              { icon: Scale, title: 'Employment Law Guidance', desc: 'We provide guidance on employment law matters, helping you navigate recruitment, redundancy, and related challenges.' },
              { icon: Building2, title: 'Scalable Solutions', desc: 'Whether you are hiring your first team member or managing a large workforce, we offer solutions that scale with your needs.' },
            ].map((item, i) => (
              <Reveal key={item.title} axis="y" delay={i * 0.05}>
                <div className="glass-premium rounded-2xl p-7 h-full group transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl glass flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                    <item.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ────────────────────────────────────────── */}
      <section id="services" className="py-32 px-6 bg-background border-t border-border/20 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal axis="y" className="text-center mb-20">
            <p className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] mb-4">What We Do</p>
            <h2 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
              Our <Accent>services.</Accent>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
              From employment status determination to full payroll management and beyond — we are here to support you.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s, i) => (
              <Reveal key={s.title} axis="y" delay={i * 0.05}>
                <div onClick={() => navigate(s.href)} className="glass-premium rounded-2xl p-7 h-full group cursor-pointer transition-all duration-300">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-11 h-11 rounded-xl glass flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <s.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-foreground mb-2 group-hover:text-primary transition-colors">{s.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-[3.75rem]">
                    {s.tags.map(t => (
                      <span key={t} className="text-[9px] font-medium text-muted-foreground/60 bg-muted/50 px-2.5 py-1 rounded-full uppercase tracking-widest">{t}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMPLOYMENT STATUS DEEP-DIVE ─────────────────────── */}
      <section className="py-32 px-6 bg-background border-t border-border/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Reveal axis="left">
              <div>
                <p className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] mb-4">Employment Status</p>
                <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
                  Correct classification,<br /><Accent>reduced risk.</Accent>
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Understanding your employment status is essential for determining tax obligations, National Insurance contributions, benefits entitlements, and legal rights. Whether you engage self-employed contractors, agency workers, or PAYE employees, correct classification protects both your organisation and your workforce.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                  Our team provides detailed assessments aligned with HMRC guidelines and IR35 legislation, helping you to classify workers correctly and maintain full compliance with UK employment law. We produce thorough documentation to support your position in the event of any enquiry.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {['IR35 assessments', 'HMRC compliance', 'Worker classification', 'Audit-ready documentation'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal axis="right">
              <div className="glass-premium rounded-3xl p-8 space-y-5">
                {[
                  { icon: Scale, title: 'Status Determination', desc: 'We assess each engagement individually, considering the nature of the working relationship, control, and financial arrangements.' },
                  { icon: ShieldCheck, title: 'Regulatory Alignment', desc: 'Our assessments follow current HMRC guidance, helping to reduce the risk of reclassification, back taxes, or penalties.' },
                  { icon: FileText, title: 'Full Documentation', desc: 'We provide comprehensive reports and supporting evidence, so your organisation is prepared for any compliance review.' },
                ].map((item, i) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => navigate('/services/employment-status')}
                  className="w-full rounded-xl gap-2 mt-2">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PAYROLL DEEP-DIVE ──────────────────────────────── */}
      <section className="py-32 px-6 bg-background border-t border-border/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Reveal axis="left" className="order-2 md:order-1">
              <div className="glass-premium rounded-3xl p-8 space-y-5">
                {[
                  { icon: FileText, title: 'Wage & Deductions', desc: 'Accurate calculation of wages, income tax, National Insurance, pension contributions, and any applicable levies — fully itemised on every payslip.' },
                  { icon: BarChart3, title: 'Invoice Management', desc: 'Once timesheets are approved, we generate and submit invoices on your behalf, providing clear breakdowns and following up on payments.' },
                  { icon: Shield, title: 'HMRC Submissions', desc: 'All payroll data is submitted to HMRC in accordance with Real Time Information (RTI) requirements, keeping you compliant at every stage.' },
                ].map((item, i) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => navigate('/services/payroll-services')}
                  className="w-full rounded-xl gap-2 mt-2">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Reveal>
            <Reveal axis="right" className="order-1 md:order-2">
              <div>
                <p className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] mb-4">Payroll Services</p>
                <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
                  Accurate payroll,<br /><Accent>on time.</Accent>
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  We manage end-to-end payroll processing, ensuring your workforce is paid correctly and promptly. Our service covers everything from calculating gross pay and deductions to generating payslips and submitting returns to HMRC.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                  Whether your contractors are on weekly or monthly schedules, our streamlined system handles the complexity — including self-billed invoicing, VAT calculations, and detailed payment breakdowns — so you can maintain full transparency with your workforce.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {['Tax & NI deductions', 'Pension contributions', 'Payslip generation', 'Self-billed invoices'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── HR DEEP-DIVE ──────────────────────────────────── */}
      <section className="py-32 px-6 bg-background border-t border-border/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Reveal axis="left">
              <div>
                <p className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] mb-4">HR Services</p>
                <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
                  People-focused<br /><Accent>HR support.</Accent>
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Whether you are preparing to hire your first employee or managing a workforce of several hundred, our HR team provides practical, tailored support. We cover the full spectrum — from recruitment and onboarding through to performance management and exit processes.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                  We help you navigate the complexities of employment law, resolve sensitive workplace issues, address absenteeism, and build a positive culture that supports retention. Our aim is to give you confidence in your people processes, so you can focus on running your business.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {['Recruitment support', 'Performance management', 'Absence management', 'Employment law guidance'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal axis="right">
              <div className="glass-premium rounded-3xl p-8 space-y-5">
                {[
                  { icon: Users, title: 'Employee Engagement', desc: 'We help you develop strategies to improve workplace satisfaction and build a culture that attracts and retains talent.' },
                  { icon: Briefcase, title: 'Legal Compliance', desc: 'Guidance on your responsibilities as an employer, covering disciplinary procedures, grievance handling, and redundancy processes.' },
                  { icon: TrendingUp, title: 'Workforce Planning', desc: 'Support with organisational design, succession planning, and workforce restructuring to meet your evolving business needs.' },
                ].map((item, i) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => navigate('/services/hr-services')}
                  className="w-full rounded-xl gap-2 mt-2">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-background border-t border-border/20">
        <div className="max-w-7xl mx-auto">
          <Reveal axis="y" className="text-center mb-20">
            <p className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] mb-4">Industries</p>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
              Sectors we <Accent>support.</Accent>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
              We work with organisations across a wide range of industries, providing tailored employment and payroll solutions.
            </p>
          </Reveal>

          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            {industries.map((ind, i) => (
              <Reveal key={ind.title} axis="y" delay={i * 0.04}>
                <div onClick={() => navigate(ind.href)} className="glass-premium rounded-2xl p-6 text-center group transition-all duration-300 cursor-pointer hover:border-primary/20">
                  <div className="w-12 h-12 rounded-xl glass mx-auto mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <ind.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-foreground">{ind.title}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ─────────────────────────────────────────── */}
      <section id="process" className="py-32 px-6 bg-background border-t border-border/20 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal axis="y" className="text-center mb-20">
            <p className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] mb-4">Our Process</p>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
              Employment Status,<br />Payroll & <Accent>HR.</Accent>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
              A streamlined three-step approach designed to support compliance, accuracy, and peace of mind.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {processSteps.map((step, i) => (
              <Reveal key={step.n} axis="y" delay={i * 0.1}>
                <div className="glass-premium rounded-3xl p-8 h-full text-center group transition-all duration-300 relative">
                  {i < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 z-20">
                      <ArrowRight className="w-6 h-6 text-primary/30" />
                    </div>
                  )}
                  <span className="text-6xl font-medium text-primary/10 block mb-4">{step.n}</span>
                  <div className="w-14 h-14 rounded-2xl glass mx-auto mb-5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <step.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Testimonial */}
          <Reveal axis="y">
            <div className="glass-premium rounded-3xl p-10 max-w-3xl mx-auto text-center">
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-primary fill-primary" />)}
              </div>
              <p className="text-lg text-foreground leading-relaxed mb-6 italic">
                "The user-friendly interface and accessibility of payroll-related data have made the entire process transparent and hassle-free. AMEX has consistently demonstrated a high level of professionalism, responsiveness, and adaptability to our specific needs."
              </p>
              <p className="text-sm font-medium text-foreground">Jane Jordan</p>
              <p className="text-xs text-muted-foreground">Client</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CONTACT ─────────────────────────────────────────── */}
      <section id="contact" className="py-32 px-6 bg-background border-t border-border/20 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal axis="y" className="text-center mb-20">
            <p className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] mb-4">Contact</p>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
              Get in <Accent>touch.</Accent>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
              Speak to our team about how we can support your organisation with employment status, payroll, and HR services.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: MapPin, label: 'Visit Us', value: 'Pemberton House, Stafford Park 1, TF3 3BD', href: 'https://maps.google.com/?q=Pemberton+House+Stafford+Park+1+TF3+3BD' },
              { icon: Phone, label: 'Call Us', value: '01952 973737', href: 'tel:+01952973737' },
              { icon: Mail, label: 'Email Us', value: 'info@amexoutsourcing.com', href: 'mailto:info@amexoutsourcing.com' },
            ].map((item, i) => (
              <Reveal key={item.label} axis="y" delay={i * 0.08}>
                <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                  className="glass-premium rounded-2xl p-8 text-center block group transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl glass mx-auto mb-5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <item.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-2">{item.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.value}</p>
                </a>
              </Reveal>
            ))}
          </div>

          <Reveal axis="y" delay={0.2} className="mt-12 text-center">
            <Button size="lg" onClick={() => window.location.href = 'tel:+01952973737'}
              className="rounded-full px-10 h-12 shadow-lg shadow-primary/20 gap-2.5 text-[15px] font-medium">
              <Phone className="w-4 h-4" /> Call Us Now
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-background border-t border-border/20">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <img src={ctaHandshakeImg} alt="Business partnership" className="absolute inset-0 w-full h-full object-cover" loading="lazy" width={1280} height={640} />
            <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
            <div className="relative px-10 py-20 flex flex-col md:flex-row items-center justify-between gap-10">
              <Reveal axis="left">
                <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-medium text-foreground leading-tight tracking-tight mb-3">
                  Take your business<br /><Accent>further.</Accent>
                </h2>
                <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                  Employment status, payroll, and HR services — all under one roof. Let us handle the complexity.
                </p>
              </Reveal>
              <Reveal axis="right" className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
                <Button onClick={() => navigate('/contact')} size="lg"
                  className="rounded-full px-8 h-12 shadow-lg shadow-primary/30 gap-2 w-full sm:w-auto">
                  Get in Touch <ArrowRight className="w-4 h-4" />
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="py-16 px-6 border-t border-border/20 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="AMEX Outsourcing" className="h-8 object-contain" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Employment status, payroll, HR, and compliance services for businesses across the UK.
              </p>
              <p className="text-xs text-muted-foreground">
                Pemberton House, Stafford Park 1, TF3 3BD
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-foreground uppercase tracking-widest mb-4">Quick Links</p>
              <div className="space-y-2.5">
                {[{ label: 'About', href: '/about' }, { label: 'Process', href: '/process' }, { label: 'Contact', href: '/contact' }].map(l => (
                  <button key={l.label} onClick={() => navigate(l.href)}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-foreground uppercase tracking-widest mb-4">Services</p>
              <div className="space-y-2.5">
                {serviceLinks.slice(0, 4).map(s => (
                  <button key={s.label} onClick={() => navigate(s.href)}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-foreground uppercase tracking-widest mb-4">Portal Login</p>
              <div className="space-y-3">
                <Button variant="outline" size="sm" onClick={() => navigate('/auth/client')}
                  className="w-full justify-start gap-2 rounded-xl text-sm">
                  <Building2 className="w-4 h-4 text-primary" /> Admin Portal
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/auth/portal')}
                  className="w-full justify-start gap-2 rounded-xl text-sm">
                  <Users className="w-4 h-4 text-primary" /> Client Portal
                </Button>
              </div>
              <div className="mt-5 space-y-1.5">
                <a href="tel:+01952973737" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="w-3.5 h-3.5" /> 01952 973737
                </a>
                <a href="mailto:info@amexoutsourcing.com" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="w-3.5 h-3.5" /> info@amexoutsourcing.com
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
            <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} AMEX Outsourcing Ltd. All Rights Reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
