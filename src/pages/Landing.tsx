import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, CheckCircle2, ShieldCheck, Clock, Users,
  FileText, BarChart3, Headphones, MapPin, Phone, Mail,
  ChevronRight, Building2, Scale, Briefcase, ClipboardCheck,
  Shield, Star, TrendingUp, Sparkles,
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

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

/* ── Floating Orb ──────────────────────────────────────────── */
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay }}
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const navLinks = [
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services/employment-status' },
    { label: 'Process', href: '/process' },
    { label: 'Contact', href: '/contact' },
  ];
  const scrollTo = (id: string) => {
    setMenuOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const services = [
    { icon: Scale, title: 'Employment Status', desc: 'Expert classification of contractors and employees. We ensure correct employment status to prevent reclassification issues, back taxes, or legal challenges — fully compliant with UK law.', tags: ['IR35', 'HMRC', 'Classification'] },
    { icon: FileText, title: 'Payroll Services', desc: 'End-to-end payroll management including wage calculations, tax deductions, National Insurance, pension contributions, and payslip generation. Accurate and on-time, every time.', tags: ['PAYE', 'NI', 'Pensions'] },
    { icon: Briefcase, title: 'HR Services', desc: 'Comprehensive human resources support — from recruitment and onboarding to performance management, employee engagement, and legal risk mitigation for thriving workplaces.', tags: ['Recruitment', 'Compliance', 'Engagement'] },
    { icon: ClipboardCheck, title: 'Timesheet Management', desc: 'User-friendly timesheet submission system with clock in/out, GPS tracking, and automated approval workflows. Streamlined so you can focus on your core work.', tags: ['Clock In/Out', 'GPS', 'Automated'] },
    { icon: BarChart3, title: 'Billing & Invoicing', desc: 'We handle all invoicing on your behalf — generating, submitting, and following up on payments. Clear and accurate breakdowns of services provided with full transparency.', tags: ['Auto-Invoice', 'Self-Bill', 'VAT'] },
    { icon: ShieldCheck, title: 'Compliance & Legal', desc: 'Quarterly compliance audits keep you updated with regulatory requirements. Our legal risk mitigation services protect your business from potential challenges in today\'s dynamic environment.', tags: ['Audits', 'Legal', 'Risk'] },
  ];

  const processSteps = [
    { n: '01', icon: Scale, title: 'Employment Status', desc: 'Determine correct employment classification with guidance on tax, National Insurance, benefits, and legal rights.' },
    { n: '02', icon: ShieldCheck, title: 'Compliance', desc: 'Worry-free, up-to-date compliance ensuring your organisation follows the latest laws, regulations, and standards.' },
    { n: '03', icon: FileText, title: 'Quality Payroll', desc: 'Calculating wages, taxes, and deductions with full regulatory compliance, freeing you to focus on core activities.' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden font-sans">

      {/* ── NAV ─────────────────────────────────────────────── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-4 left-4 right-4 z-50 glass-premium rounded-2xl shadow-lg">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="AMEX Outsourcing" className="h-8 object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <button key={l.label} onClick={() => navigate(l.href)}
                className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/60">
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth/client')} className="hidden sm:flex text-muted-foreground text-[13px]">
              Sign In
            </Button>
            <Button size="sm" onClick={() => scrollTo('contact')} className="rounded-full px-5 gap-1.5 text-[13px] shadow-lg shadow-primary/20">
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
              {navLinks.map((l, i) => (
                <motion.button key={l.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }} onClick={() => navigate(l.href)}
                  className="flex items-center justify-between w-full px-4 py-3.5 text-base font-semibold text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                  {l.label}<ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </motion.button>
              ))}
              <div className="h-px bg-border/40 my-2" />
              {[
                { label: 'Admin Login', route: '/auth/client' },
                { label: 'Client Login', route: '/auth/portal' },
              ].map((item, i) => (
                <motion.button key={item.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navLinks.length + i) * 0.05 }}
                  onClick={() => { setMenuOpen(false); navigate(item.route); }}
                  className="flex items-center justify-between w-full px-4 py-3.5 text-base font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-xl transition-colors">
                  {item.label}<ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[100vh] flex flex-col justify-center overflow-hidden">
        <FloatingOrb className="w-[600px] h-[600px] bg-primary/[0.07] top-[10%] left-[0%]" delay={0} />
        <FloatingOrb className="w-[500px] h-[500px] bg-violet-500/[0.05] top-[20%] right-[0%]" delay={2} />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute inset-0 hero-mesh" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-7xl mx-auto px-6 pt-36 pb-32 w-full relative z-10">
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }} className="mb-8">
            <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold text-primary glass-premium px-5 py-2.5 rounded-full uppercase tracking-[0.14em]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Employment Status Specialists
            </span>
          </motion.div>

          <div className="mb-12">
            <div className="overflow-hidden">
              <motion.h1 initial={{ y: '110%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-[clamp(3rem,8vw,6.5rem)] font-bold tracking-tight leading-[0.92] text-foreground">
                Take your
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1 initial={{ y: '110%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="text-[clamp(3rem,8vw,6.5rem)] tracking-tighter leading-[0.92]">
                <span className="text-foreground font-black">business </span><Accent>further.</Accent>
              </motion.h1>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_480px] gap-20 items-end">
            <div>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-muted-foreground max-w-xl leading-relaxed text-lg mb-10">
                We provide comprehensive employment status services, payroll management, and HR support. Our expert team ensures you are correctly classified and compliant with UK laws, so you can focus on your work with <Accent className="text-lg">peace of mind</Accent>.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.72 }}
                className="flex flex-col sm:flex-row flex-wrap gap-3 mb-12">
                <Button size="lg" onClick={() => scrollTo('contact')}
                  className="rounded-full px-8 h-[3.25rem] shadow-xl shadow-primary/25 gap-2.5 w-full sm:w-auto text-[15px] font-semibold">
                  Contact Us <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/auth/client')}
                  className="rounded-full px-8 h-[3.25rem] w-full sm:w-auto text-[15px]">
                  Sign In <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                className="flex flex-wrap gap-x-8 gap-y-3">
                {[
                  { icon: ShieldCheck, label: 'HMRC Compliant' },
                  { icon: Users, label: '90+ Clients' },
                  { icon: Clock, label: '24/7 Support' },
                  { icon: Star, label: '100% Quality Assured' },
                ].map(({ icon: Ic, label }) => (
                  <div key={label} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
                      <Ic className="w-3.5 h-3.5 text-primary/70" strokeWidth={1.5} />
                    </div>
                    {label}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Stats card */}
            <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block">
              <div className="glass-premium rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Why AMEX Outsourcing?</p>
                    <p className="text-xs text-muted-foreground">Trusted by businesses across the UK</p>
                  </div>
                </div>
                {[
                  { label: 'Self-Employed Classification Accuracy', value: '100%' },
                  { label: 'Employee Satisfaction', value: '98%' },
                  { label: 'Quarterly Compliance Audits', value: 'Every Quarter' },
                  { label: 'Improved Workforce Stability', value: 'Proven Results' },
                ].map((item, i) => (
                  <motion.div key={item.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-semibold text-foreground">{item.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
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
              { to: 100, suffix: '%', label: 'Quality Assured', sub: 'on every service' },
              { to: 90, suffix: '+', label: 'Clientele', sub: 'businesses served' },
              { to: 45, suffix: '+', label: 'Business Advices', sub: 'delivered to date' },
              { to: 12, suffix: '+', label: 'Businesses Helped', sub: 'directly transformed' },
            ].map((s, i) => (
              <Reveal key={s.label} axis={i < 2 ? 'left' : 'right'} delay={i * 0.06}
                className="px-6 py-16 md:py-20 text-center border-r border-border/20 last:border-r-0">
                <p className="text-[clamp(3rem,7vw,5rem)] font-semibold text-foreground leading-none mb-3 tabular-nums tracking-tight">
                  <Counter to={s.to} suffix={s.suffix} />
                </p>
                <p className="text-sm font-semibold text-foreground mb-0.5">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────── */}
      <section id="about" className="py-32 px-6 bg-background relative">
        <FloatingOrb className="w-[400px] h-[400px] bg-primary/[0.04] top-[20%] right-[5%]" delay={1} />
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal axis="y" className="text-center mb-20">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">About Us</p>
            <h2 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-semibold text-foreground leading-tight tracking-tight mb-6">
              Be at the forefront<br />of <Accent>innovation.</Accent>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
              We have achieved our success through endeavours to provide a compliant and customer focused service that benefits both businesses and contractors. Our tailored approach ensures every client receives personalised solutions.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Sparkles, title: 'Discover the Difference', desc: 'A compliant and customer-focused service that benefits both businesses and contractors, tailored to your specific industry needs.' },
              { icon: Headphones, title: '24/7 Customer Support', desc: 'Round-the-clock support means you are being looked after wherever you are in the world. Always available when you need us.' },
              { icon: ShieldCheck, title: 'Compliance First', desc: 'Comprehensive compliance audits conducted every quarter, keeping organisations updated with regulatory requirements and prepared for changes.' },
              { icon: Users, title: 'Workforce Stability', desc: 'Our HR process improvements lead to higher employee retention, creating a stable workforce that supports long-term organisational growth.' },
              { icon: Scale, title: 'Legal Expertise', desc: 'Navigate the intricate landscape of employment law, ensuring you avoid possible challenges during recruitment, redundancy, and beyond.' },
              { icon: Building2, title: 'Bespoke Solutions', desc: 'Whether hiring your first staff member or managing hundreds, our extensive expertise allows us to provide innovative, tailored solutions.' },
            ].map((item, i) => (
              <Reveal key={item.title} axis="y" delay={i * 0.05}>
                <div className="glass-premium rounded-2xl p-7 h-full group hover:glow-ring transition-all duration-500">
                  <div className="w-11 h-11 rounded-xl glass flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ────────────────────────────────────────── */}
      <section id="services" className="py-32 px-6 bg-background border-t border-border/20 relative">
        <FloatingOrb className="w-[350px] h-[350px] bg-violet-500/[0.04] top-[30%] left-[5%]" delay={3} />
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal axis="y" className="text-center mb-20">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">What We Do</p>
            <h2 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-semibold text-foreground leading-tight tracking-tight mb-6">
              Services we're<br /><Accent>offering.</Accent>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
              Excellent service and support for you — from employment status determination to full payroll management and beyond.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s, i) => (
              <Reveal key={s.title} axis="y" delay={i * 0.05}>
                <div className="glass-premium rounded-2xl p-7 h-full group hover:glow-ring transition-all duration-500">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-11 h-11 rounded-xl glass flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <s.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{s.title}</h3>
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

      {/* ── PROCESS ─────────────────────────────────────────── */}
      <section id="process" className="py-32 px-6 bg-background border-t border-border/20 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal axis="y" className="text-center mb-20">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">Our Process</p>
            <h2 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-semibold text-foreground leading-tight tracking-tight mb-6">
              Employment Status,<br />Payroll & <Accent>HR.</Accent>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
              A streamlined three-step process that ensures compliance, accuracy, and peace of mind for your organisation.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {processSteps.map((step, i) => (
              <Reveal key={step.n} axis="y" delay={i * 0.1}>
                <div className="glass-premium rounded-3xl p-8 h-full text-center group hover:glow-ring transition-all duration-500 relative">
                  {i < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 z-20">
                      <ArrowRight className="w-6 h-6 text-primary/30" />
                    </div>
                  )}
                  <span className="text-6xl font-bold text-primary/10 block mb-4">{step.n}</span>
                  <div className="w-14 h-14 rounded-2xl glass mx-auto mb-5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
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
              <p className="text-sm font-semibold text-foreground">Jane Jordan</p>
              <p className="text-xs text-muted-foreground">Client</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CONTACT ─────────────────────────────────────────── */}
      <section id="contact" className="py-32 px-6 bg-background border-t border-border/20 relative">
        <FloatingOrb className="w-[400px] h-[400px] bg-primary/[0.05] top-[10%] left-[5%]" delay={1} />
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal axis="y" className="text-center mb-20">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">Contact</p>
            <h2 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-semibold text-foreground leading-tight tracking-tight mb-6">
              We're delivering the best<br /><Accent>customer experience.</Accent>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
              Get in touch today and discover how AMEX Outsourcing can support your business with employment status, payroll, and HR services.
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
                  className="glass-premium rounded-2xl p-8 text-center block group hover:glow-ring transition-all duration-500 h-full">
                  <div className="w-14 h-14 rounded-2xl glass mx-auto mb-5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-2">{item.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.value}</p>
                </a>
              </Reveal>
            ))}
          </div>

          <Reveal axis="y" delay={0.2} className="mt-12 text-center">
            <Button size="lg" onClick={() => window.location.href = 'tel:+01952973737'}
              className="rounded-full px-10 h-12 shadow-lg shadow-primary/20 gap-2.5 text-[15px] font-semibold">
              <Phone className="w-4 h-4" /> Call Us Now
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-background border-t border-border/20">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl glass-premium overflow-hidden px-10 py-20 border-2 !border-primary/15">
            <div className="absolute inset-0 hero-mesh pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
              <span className="text-[clamp(6rem,18vw,16rem)] font-bold text-primary/[0.03] leading-none whitespace-nowrap tracking-tighter">
                AMEX Outsourcing
              </span>
            </div>
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-10">
              <Reveal axis="left">
                <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-semibold text-foreground leading-tight tracking-tight mb-3">
                  Take your business<br /><Accent>further.</Accent>
                </h2>
                <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                  Employment status, payroll, and HR services — all under one roof. Let us handle the complexity.
                </p>
              </Reveal>
              <Reveal axis="right" className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
                <Button onClick={() => scrollTo('contact')} size="lg"
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
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="AMEX Outsourcing" className="h-8 object-contain" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Employment Status Specialists. Providing compliant payroll, HR, and employment status services across the UK.
              </p>
              <p className="text-xs text-muted-foreground">
                Pemberton House, Stafford Park 1, TF3 3BD
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-4">Quick Links</p>
              <div className="space-y-2.5">
                {navLinks.map(l => (
                  <button key={l.label} onClick={() => navigate(l.href)}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-4">Services</p>
              <div className="space-y-2.5">
                {['Employment Status', 'Payroll Services', 'HR Services', 'Compliance & Legal'].map(s => (
                  <button key={s} onClick={() => scrollTo('services')}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Login Portals */}
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-4">Portal Login</p>
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
