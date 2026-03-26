import { useNavigate } from 'react-router-dom';
import {
  motion, AnimatePresence, useInView,
  useScroll, useTransform,
} from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  ArrowRight, FileText, Users, BarChart3, ShieldCheck, Shield,
  Upload, Zap, Download, CheckCircle2, Clock, Globe, Lock,
  Mail, MapPin, Calculator, FolderOpen, Headphones,
  FileCheck, Wrench, Palette, Plug, Settings2,
  PhoneCall, ArrowUpRight, Star, TrendingUp, Send, Sparkles,
  Building2, ChevronRight, Play, Minus, Plus,
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────
// SCROLL DIRECTION
// ─────────────────────────────────────────────────────────────
function useScrollDirection() {
  const [dir, setDir] = useState<'down' | 'up'>('down');
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const curr = window.scrollY;
      if (Math.abs(curr - last) > 4) {
        setDir(curr > last ? 'down' : 'up');
        last = curr;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return dir;
}

// ─────────────────────────────────────────────────────────────
// REVEAL
// ─────────────────────────────────────────────────────────────
const revealVariants = {
  hidden: (c: { scrollDir: 'down' | 'up'; axis: 'y' | 'left' | 'right' }) => {
    if (c.axis === 'left')  return { opacity: 0, x: c.scrollDir === 'down' ? -48 : 48, y: 0 };
    if (c.axis === 'right') return { opacity: 0, x: c.scrollDir === 'down' ? 48 : -48, y: 0 };
    return { opacity: 0, x: 0, y: c.scrollDir === 'down' ? 36 : -36 };
  },
  visible: { opacity: 1, x: 0, y: 0 },
};

function Reveal({
  children, delay = 0, axis = 'y', className = '', once = false,
}: {
  children: React.ReactNode; delay?: number; axis?: 'y' | 'left' | 'right'; className?: string; once?: boolean;
}) {
  const scrollDir = useScrollDirection();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-60px' });
  return (
    <motion.div ref={ref} custom={{ scrollDir, axis }} variants={revealVariants}
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// COUNTER
// ─────────────────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !triggered.current) {
        triggered.current = true;
        const dur = 1800;
        const step = (ts: number, s: number) => {
          const p = Math.min((ts - s) / dur, 1);
          setCount(Math.floor((1 - Math.pow(1 - p, 3)) * to));
          if (p < 1) requestAnimationFrame((t) => step(t, s));
        };
        requestAnimationFrame((t) => step(t, t));
      }
    }, { threshold: 0.5 });
    ob.observe(el);
    return () => ob.disconnect();
  }, [to]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ─────────────────────────────────────────────────────────────
// MARQUEE
// ─────────────────────────────────────────────────────────────
const marqueeItems = [
  'HMRC Compliant', 'UK Financial Year', 'Bulk Invoice Generation',
  'Contractor Payroll', 'Self-Billed Invoices', 'VAT Automation',
  'Client Portal', 'Document Management', 'Role-Based Access',
  'Audit-Ready Records', '52-Week Tracking', 'White-Label Available',
  'Clock In/Out Timesheets', 'GPS Tracking',
];

function Marquee() {
  return (
    <div className="overflow-hidden py-5 border-y border-border/20">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        className="flex gap-12 whitespace-nowrap w-max"
      >
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
            <span className="w-1 h-1 rounded-full bg-primary/40 inline-block" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ACCENT TEXT — Instrument Serif italic
// ─────────────────────────────────────────────────────────────
function Accent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-serif italic text-gradient ${className}`}>{children}</span>;
}

// ─────────────────────────────────────────────────────────────
// FLOATING ORB
// ─────────────────────────────────────────────────────────────
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay }}
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [candidateCount, setCandidateCount] = useState(200);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', contractors: '', message: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const navLinks = [
    { label: 'Features', href: 'features' },
    { label: 'Process', href: 'process' },
    { label: 'Pricing', href: 'pricing' },
    { label: 'Contact', href: 'contact' },
  ];
  const scrollTo = (id: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const features = [
    { icon: FileText, title: 'Master Invoice Generation', desc: 'Upload contractor timesheets and instantly generate HMRC-compliant master invoices with automatic VAT calculations, client branding, and one-click PDF export.', tags: ['Auto VAT', 'PDF Export', 'Client Branding'] },
    { icon: Clock, title: 'Timesheet Processing', desc: 'Contractors clock in and out via a shareable link with GPS location capture. Daily timesheets are auto-generated, approved, and fed directly into invoicing.', tags: ['Clock In/Out', 'GPS', 'Auto-Generate'] },
    { icon: Users, title: 'Self-Billed Invoices', desc: 'Generate bulk self-billed invoices for every contractor simultaneously. Each remittance includes full payment breakdowns and validated bank details.', tags: ['Bulk Gen', 'Bank Validation', 'Exceptions'] },
    { icon: BarChart3, title: 'Financial Dashboard', desc: 'Live analytics across revenue, contractor payments, profit margins, and weekly trends. Download formatted reports weekly, monthly, or by financial year.', tags: ['Revenue', 'P&L', 'Exports'] },
    { icon: ShieldCheck, title: 'UK Tax Compliance', desc: 'Built around the UK financial year. Automatic week numbering, period tracking, and HMRC-ready documentation — so your records are always audit-ready.', tags: ['52-week', 'HMRC', 'Audit Trail'] },
    { icon: FolderOpen, title: 'Document Management', desc: 'Every invoice and self-bill is automatically filed by financial year and week. Full-text search, bulk download, and secure cloud storage.', tags: ['Auto-filing', 'Search', 'Bulk DL'] },
    { icon: Headphones, title: 'Client Portal & Support', desc: 'Give clients their own branded login to view invoices and raise tickets. Built-in ticketing system keeps every conversation threaded and tracked.', tags: ['Portal', 'Tickets', 'Roles'] },
  ];

  const processSteps = [
    { n: '01', icon: Upload, title: 'Upload Timesheets', desc: 'Import contractor timesheet data from Excel. PayCore parses every row, maps pay rates, and flags anomalies.' },
    { n: '02', icon: Calculator, title: 'Auto-Calculate', desc: 'Applies pay rates, calculates gross pay, VAT at 20%, and employer costs — all in seconds.' },
    { n: '03', icon: Zap, title: 'Generate Invoices', desc: 'One click generates HMRC-compliant master invoices and individual self-billed remittances.' },
    { n: '04', icon: Download, title: 'Download & File', desc: 'Professional PDFs auto-filed by UK financial year and week. Send or download in bulk.' },
    { n: '05', icon: BarChart3, title: 'Track & Analyse', desc: 'Every payment feeds your live dashboard. Track revenue, costs, and profit margins.' },
  ];

  const priceTier = candidateCount <= 200 ? 4 : candidateCount <= 1000 ? 3 : 2.5;
  const monthlyTotal = candidateCount * priceTier;
  const savingsPct = priceTier === 3 ? '25%' : priceTier === 2.5 ? '37%' : null;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden font-sans">

      {/* ── NAV ─────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-4 left-4 right-4 z-50 glass-premium rounded-2xl shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="PayCore" className="w-8 h-8 rounded-lg object-contain" />
            <div className="leading-none">
              <span className="font-bold text-sm text-foreground tracking-tight">PayCore</span>
              <span className="text-[9px] text-muted-foreground block mt-0.5 tracking-widest uppercase">by FirmFlow</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <button key={l.label} onClick={() => scrollTo(l.href)}
                className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/60">
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth/portal')} className="hidden sm:flex text-muted-foreground text-[13px] gap-1.5">
              <Users className="h-3.5 w-3.5" />Portal
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth/client')} className="hidden sm:flex text-muted-foreground text-[13px] gap-1.5">
              <Building2 className="h-3.5 w-3.5" />Client
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth/team')} className="hidden lg:flex text-muted-foreground text-[13px] gap-1.5">
              <Shield className="h-3.5 w-3.5" />Team
            </Button>
            <Button size="sm" onClick={() => scrollTo('contact')} className="rounded-full px-5 gap-1.5 text-[13px] shadow-lg shadow-primary/20">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
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
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden fixed top-[4.5rem] left-4 right-4 z-40 glass-premium rounded-2xl overflow-hidden shadow-lg"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((l, i) => (
                <motion.button key={l.label}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => scrollTo(l.href)}
                  className="flex items-center justify-between w-full px-4 py-3.5 text-base font-semibold text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                  {l.label}
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </motion.button>
              ))}
              <div className="h-px bg-border/40 my-2" />
              {[
                { label: 'Portal Login', route: '/auth/portal' },
                { label: 'Client Login', route: '/auth/client' },
                { label: 'Team Login', route: '/auth/team' },
              ].map((item, i) => (
                <motion.button key={item.label}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navLinks.length + i) * 0.05 }}
                  onClick={() => { setMenuOpen(false); navigate(item.route); }}
                  className="flex items-center justify-between w-full px-4 py-3.5 text-base font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-xl transition-colors">
                  {item.label}
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
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
        <FloatingOrb className="w-[350px] h-[350px] bg-emerald-500/[0.04] bottom-[10%] left-[35%]" delay={4} />

        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute inset-0 hero-mesh" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-7xl mx-auto px-6 pt-36 pb-32 w-full relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2.5 text-[11px] font-bold text-primary glass-premium px-5 py-2.5 rounded-full uppercase tracking-[0.14em]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              UK Contractor Payroll Platform
            </span>
          </motion.div>

          {/* Headline — mixed fonts */}
          <div className="mb-12">
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-[clamp(3rem,9vw,7.5rem)] font-black tracking-tighter leading-[0.92] text-foreground"
              >
                Payroll
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="text-[clamp(3rem,9vw,7.5rem)] tracking-tighter leading-[0.92]"
              >
                <Accent>without</Accent> <span className="text-foreground font-black">the</span>
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
                className="text-[clamp(3rem,9vw,7.5rem)] font-black tracking-tighter leading-[0.92] text-foreground"
              >
                chaos.
              </motion.h1>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_480px] gap-20 items-end">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-muted-foreground max-w-lg leading-relaxed text-lg mb-10"
              >
                PayCore automates the entire UK contractor payment cycle — timesheets in, HMRC-compliant invoices and self-billed remittances out. Built for <Accent className="text-lg">recruitment agencies</Accent>.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.72 }}
                className="flex flex-col sm:flex-row flex-wrap gap-3 mb-12"
              >
                <Button size="lg" onClick={() => scrollTo('contact')}
                  className="rounded-full px-8 h-[3.25rem] shadow-xl shadow-primary/25 gap-2.5 w-full sm:w-auto text-[15px] font-semibold">
                  <Play className="w-4 h-4 fill-current" /> Book a Free Demo
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/auth')}
                  className="rounded-full px-8 h-[3.25rem] w-full sm:w-auto text-[15px]">
                  Sign In <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex flex-wrap gap-x-8 gap-y-3"
              >
                {[
                  { icon: ShieldCheck, label: 'HMRC Compliant' },
                  { icon: Lock, label: 'Bank-Grade Security' },
                  { icon: Clock, label: '24/7 Cloud Access' },
                  { icon: Globe, label: 'UK-Built Platform' },
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

            {/* Dashboard preview */}
            <motion.div
              initial={{ opacity: 0, y: 60, rotateX: 6 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block relative"
              style={{ perspective: '1400px' }}
            >
              <div className="glass-premium rounded-3xl overflow-hidden shadow-2xl">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/20">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-warning/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-success/50" />
                  </div>
                  <div className="flex-1 mx-6">
                    <div className="h-6 bg-muted/30 rounded-full flex items-center px-3">
                      <Lock className="w-2.5 h-2.5 text-muted-foreground/40 mr-1.5" />
                      <span className="text-[10px] text-muted-foreground/50 font-medium">app.paycore.io/dashboard</span>
                    </div>
                  </div>
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-3 gap-3 p-4">
                  {[
                    { label: 'Revenue (W14)', value: '£124.5k', trend: '+12%', c: 'text-emerald-500' },
                    { label: 'Invoices Sent', value: '48', trend: 'This week', c: 'text-primary' },
                    { label: 'Contractors', value: '156', trend: 'Active', c: 'text-foreground' },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted/20 rounded-xl p-3 border border-border/15">
                      <p className="text-[9px] text-muted-foreground mb-0.5">{s.label}</p>
                      <p className="text-lg font-bold text-foreground leading-none mb-0.5">{s.value}</p>
                      <p className={`text-[9px] font-semibold ${s.c}`}>{s.trend}</p>
                    </div>
                  ))}
                </div>

                {/* Mini chart */}
                <div className="px-4 pb-2">
                  <div className="bg-muted/15 rounded-xl p-3 border border-border/15">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Revenue Trend</p>
                    <div className="flex items-end gap-[3px] h-14">
                      {[40, 55, 35, 65, 50, 75, 60, 80, 70, 90, 85, 95].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.6, delay: 0.9 + i * 0.05 }}
                          className={`flex-1 rounded-sm min-h-[2px] ${i >= 10 ? 'bg-primary' : 'bg-primary/25'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Invoice rows */}
                <div className="p-4 pt-2 space-y-1.5">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Recent Invoices</p>
                  {[
                    { id: 'INV-001', name: 'Acme Staffing', amt: '£8,450', status: 'Paid', sc: 'bg-emerald-500/10 text-emerald-600' },
                    { id: 'INV-002', name: 'TechRecruit Ltd', amt: '£12,200', status: 'Sent', sc: 'bg-primary/10 text-primary' },
                    { id: 'INV-003', name: 'ProStaff UK', amt: '£5,800', status: 'Draft', sc: 'bg-muted text-muted-foreground' },
                  ].map((r) => (
                    <div key={r.id} className="flex items-center justify-between px-3 py-2.5 bg-muted/10 rounded-lg border border-border/10">
                      <div>
                        <p className="text-[11px] font-semibold text-foreground">{r.id}</p>
                        <p className="text-[9px] text-muted-foreground">{r.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-bold text-foreground">{r.amt}</p>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${r.sc}`}>{r.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-5 -left-8 glass-premium rounded-2xl px-4 py-3 flex items-center gap-3 glow-ring"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-foreground">Invoice Generated</p>
                  <p className="text-[9px] text-muted-foreground">Just now · £8,450</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute -bottom-4 -right-6 glass-premium rounded-2xl px-4 py-3 glow-ring"
              >
                <p className="text-[9px] text-muted-foreground mb-0.5">Week 14 Revenue</p>
                <p className="text-base font-bold text-gradient">£32,450 <TrendingUp className="inline w-3.5 h-3.5 text-emerald-500" /></p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border-2 border-primary/30 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-primary/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── MARQUEE ─────────────────────────────────────────── */}
      <Marquee />

      {/* ── STATS ───────────────────────────────────────────── */}
      <section className="py-0 border-b border-border/20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { to: 52, suffix: '', label: 'Financial Weeks', sub: 'auto-tracked yearly', axis: 'left' as const },
              { to: 100, suffix: '%', label: 'HMRC Compliant', sub: 'on every export', axis: 'left' as const },
              { to: 99, suffix: '%', label: 'Platform Uptime', sub: 'guaranteed SLA', axis: 'right' as const },
              { to: 2, suffix: 'min', label: 'To First Invoice', sub: 'from raw timesheets', axis: 'right' as const },
            ].map((s, i) => (
              <Reveal key={s.label} axis={s.axis} delay={i * 0.06}
                className="px-6 py-16 md:py-20 text-center border-r border-border/20 last:border-r-0">
                <p className="text-[clamp(3rem,7vw,5rem)] font-black text-foreground leading-none mb-3 tabular-nums tracking-tight">
                  <Counter to={s.to} suffix={s.suffix} />
                </p>
                <p className="text-sm font-semibold text-foreground mb-0.5">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES — Bento grid ───────────────────────────── */}
      <section id="features" className="py-32 px-6 bg-background relative">
        <FloatingOrb className="w-[400px] h-[400px] bg-primary/[0.04] top-[20%] right-[5%]" delay={1} />
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal axis="y" className="text-center mb-20">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">02 — Features</p>
            <h2 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-black text-foreground leading-[0.95] tracking-tight mb-6">
              Everything your<br />agency <Accent>needs.</Accent>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
              From first timesheet upload to final payment reconciliation — PayCore covers every step of the contractor payroll process.
            </p>
          </Reveal>

          {/* Bento grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <Reveal key={f.title} axis="y" delay={i * 0.05}
                className={i === 0 ? 'lg:col-span-2' : i === 3 ? 'lg:col-span-2' : ''}>
                <div className="glass-premium rounded-2xl p-7 h-full group hover:glow-ring transition-all duration-500">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-11 h-11 rounded-xl glass flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <f.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-[3.75rem]">
                    {f.tags.map((t) => (
                      <span key={t} className="text-[9px] font-bold text-muted-foreground/60 bg-muted/50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                        {t}
                      </span>
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
        <FloatingOrb className="w-[350px] h-[350px] bg-violet-500/[0.04] top-[30%] left-[5%]" delay={3} />
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal axis="y" className="text-center mb-20">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">03 — Process</p>
            <h2 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-black text-foreground leading-[0.95] tracking-tight mb-6">
              Five steps.<br /><Accent>Fully automated.</Accent>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
              PayCore replaces a week of manual payroll work with a five-step automated pipeline that runs in under two minutes.
            </p>
          </Reveal>

          {/* Horizontal steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-20">
            {processSteps.map((step, i) => (
              <Reveal key={step.n} axis="y" delay={i * 0.08}>
                <div className="glass-premium rounded-2xl p-6 h-full text-center group hover:glow-ring transition-all duration-500 relative">
                  {i < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 z-20">
                      <ArrowRight className="w-5 h-5 text-primary/30" />
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-2xl glass mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="text-[9px] font-bold text-primary/50 tracking-widest block mb-2">{step.n}</span>
                  <h3 className="text-sm font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Before / After */}
          <Reveal axis="y" delay={0.1}>
            <div className="rounded-3xl overflow-hidden glass-premium grid md:grid-cols-2">
              <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-border/15">
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.18em] mb-5 flex items-center gap-2">
                  <span className="w-4 h-px bg-muted-foreground/30 inline-block" /> Without PayCore
                </p>
                <ul className="space-y-3.5">
                  {[
                    'Manual Excel consolidation (2–4 hours)',
                    'Spreadsheet VAT calculations — error-prone',
                    'Individual PDF invoices per contractor',
                    'Manual filing by date and client',
                    'HMRC compliance checked manually',
                    'No real-time financial visibility',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="w-4 h-4 rounded-full border-2 border-border/40 shrink-0 mt-0.5" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 md:p-10">
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.18em] mb-5 flex items-center gap-2">
                  <span className="w-4 h-px bg-primary inline-block" /> With PayCore
                </p>
                <ul className="space-y-3.5">
                  {[
                    'One-click Excel import, parsed in seconds',
                    'Automatic VAT at 20% with full audit trail',
                    'Bulk self-bills generated simultaneously',
                    'Auto-filed by UK financial year and week',
                    'HMRC-compliant documents on every export',
                    'Live P&L dashboard, always up to date',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-sm text-foreground font-medium">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── BESPOKE ─────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-background border-t border-border/20">
        <div className="max-w-7xl mx-auto">
          <Reveal axis="y" className="text-center mb-20">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">04 — Tailored</p>
            <h2 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-black text-foreground leading-[0.95] tracking-tight mb-6">
              Custom.<br /><Accent>By design.</Accent>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
              PayCore isn't one-size-fits-all. We tailor the platform to your exact workflows, branding, and compliance requirements.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Wrench, title: 'Workflow Customisation', desc: 'Modify invoice templates, approval flows, payment cycles, and reporting structures.' },
              { icon: Palette, title: 'White-Label Branding', desc: 'Apply your own logo, colours, and domain so clients see your brand — not ours.' },
              { icon: Plug, title: 'Third-Party Integrations', desc: 'Connect to your accounting software, CRM, or HR platform via custom API integrations.' },
              { icon: Settings2, title: 'Bespoke Features', desc: 'Need something unique? Our team builds custom modules and automation rules.' },
            ].map((item, i) => (
              <Reveal key={item.title} axis="y" delay={i * 0.06}>
                <div className="glass-premium rounded-2xl p-7 h-full group hover:glow-ring transition-all duration-500">
                  <div className="w-11 h-11 rounded-xl glass flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal axis="y" delay={0.1} className="mt-8 text-center">
            <Button onClick={() => scrollTo('contact')} size="lg"
              className="rounded-full px-8 h-12 gap-2 shadow-lg shadow-primary/20">
              Discuss Requirements <ArrowRight className="w-4 h-4" />
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section id="pricing" className="py-32 px-6 bg-background border-t border-border/20 relative">
        <FloatingOrb className="w-[300px] h-[300px] bg-amber-500/[0.03] bottom-[20%] right-[10%]" delay={2} />
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal axis="y" className="text-center mb-20">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">05 — Pricing</p>
            <h2 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-black text-foreground leading-[0.95] tracking-tight mb-6">
              Simple.<br /><Accent>Transparent.</Accent>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
              No hidden fees. No surprises. Plans that scale with your agency.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 mb-12">
            {/* Team */}
            <Reveal axis="left">
              <div className="rounded-3xl glass-premium p-8 flex flex-col h-full">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.18em] mb-5">Team Plan</span>
                <div className="mb-6">
                  <span className="text-5xl font-black text-foreground tracking-tight">£399</span>
                  <span className="text-muted-foreground text-sm ml-1">/ month</span>
                  <p className="text-xs text-muted-foreground mt-1.5">+ £2,000 one-time setup</p>
                </div>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed flex-1">Predictable flat-rate for growing teams up to 100 candidates.</p>
                <ul className="space-y-2.5 mb-8">
                  {['Full payroll management', 'Up to 100 candidates', 'Encrypted data handling', 'Document storage', 'Email support'].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => scrollTo('contact')} variant="outline" className="w-full rounded-xl h-11">
                  Get Started <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </Reveal>

            {/* Volume */}
            <Reveal axis="y" delay={0.1}>
              <div className="rounded-3xl glass-premium p-8 flex flex-col h-full relative border-2 !border-primary/30 shadow-xl shadow-primary/10">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-primary-foreground bg-primary px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-primary/25">
                    <Star className="w-2.5 h-2.5 fill-current" /> Most Popular
                  </span>
                </div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.18em] mb-5">Volume Plan</span>
                <div className="mb-5 bg-primary/5 border border-primary/15 rounded-2xl p-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Estimated Monthly Cost</p>
                  <AnimatePresence mode="wait">
                    <motion.div key={priceTier}
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}>
                      <span className="text-4xl font-black text-primary tracking-tight">£{monthlyTotal.toLocaleString()}</span>
                      <span className="text-muted-foreground text-sm ml-1">/ month</span>
                      {savingsPct && (
                        <span className="ml-2 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Save {savingsPct}
                        </span>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    £{priceTier % 1 === 0 ? priceTier : priceTier.toFixed(2)} × {candidateCount.toLocaleString()} candidates
                    {candidateCount > 1000 ? ' · Free setup · Free white-label' : candidateCount > 200 ? ' · £500 setup' : ' · £750 setup'}
                  </p>
                </div>
                <div className="mb-5">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-2.5">
                    <span>Candidates: <strong className="text-foreground">{candidateCount.toLocaleString()}</strong></span>
                    <AnimatePresence mode="wait">
                      <motion.span key={priceTier} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                        className={`font-bold ${priceTier === 3 ? 'text-emerald-500' : 'text-primary'}`}>
                        {candidateCount <= 200 ? 'Starter £4/ea' : candidateCount <= 1000 ? 'Growth £3/ea' : 'Scale £2.50/ea'}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <Slider min={1} max={1500} step={1} value={[candidateCount]} onValueChange={([v]) => setCandidateCount(v)} className="mb-2" />
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>1</span><span>200</span><span>1,000</span><span>1,500+</span>
                  </div>
                </div>
                <ul className="grid grid-cols-2 gap-2 mb-6 flex-1">
                  {['Full payroll processing', 'Candidate management', 'Timesheet processing', 'Compliance support', 'Email & phone support', 'Free white-label at 1,000+'].map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-foreground">
                      <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => scrollTo('contact')}
                  className="w-full rounded-xl h-11 shadow-lg shadow-primary/20">
                  Get Started — {candidateCount >= 1500 ? '1,500+' : candidateCount.toLocaleString()} Candidates
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </Reveal>

            {/* Enterprise */}
            <Reveal axis="right">
              <div className="rounded-3xl glass-premium p-8 flex flex-col h-full">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.18em] mb-5">Enterprise</span>
                <div className="mb-6">
                  <span className="text-5xl font-black text-foreground tracking-tight">Custom</span>
                  <p className="text-muted-foreground text-xs mt-1.5">Tailored to your infrastructure</p>
                </div>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed flex-1">For large groups requiring dedicated infrastructure, advanced integrations, and bespoke support.</p>
                <ul className="space-y-2.5 mb-8">
                  {['Custom pricing structure', 'Dedicated infrastructure', 'Custom API integrations', 'Advanced reporting suite', 'On-site onboarding', 'Long-term partnership'].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => scrollTo('contact')} variant="outline" className="w-full rounded-xl h-11">
                  Contact Sales <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Add-ons */}
          <div className="border-t border-border/20 pt-12">
            <Reveal axis="y" className="text-center mb-8">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.18em]">Optional Add-ons</p>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Palette, label: 'White-Label Infrastructure', desc: 'Your logo, domain, and branding — fully custom environment.', subject: 'White-Label Infrastructure Enquiry – PayCore', axis: 'left' as const },
                { icon: PhoneCall, label: 'Priority Support', desc: 'Dedicated account manager, direct phone access, priority SLAs.', subject: 'Priority Support Enquiry – PayCore', axis: 'y' as const },
                { icon: FileCheck, label: 'Managed Payroll Service', desc: 'We run your entire payroll operation end-to-end.', subject: 'Managed Payroll Service Enquiry – PayCore', axis: 'right' as const },
              ].map((a) => (
                <Reveal key={a.label} axis={a.axis}>
                  <div
                    className="group flex items-start gap-4 p-6 rounded-2xl glass-premium cursor-pointer hover:glow-ring transition-all duration-500"
                    onClick={() => window.location.href = `mailto:harsh@firmflow.app?subject=${a.subject}`}
                  >
                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <a.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground mb-1.5">{a.label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{a.desc}</p>
                      <span className="text-[10px] font-bold text-primary flex items-center gap-1">Enquire <ArrowRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ─────────────────────────────────────────── */}
      <section id="contact" className="py-32 px-6 bg-background border-t border-border/20 relative">
        <FloatingOrb className="w-[400px] h-[400px] bg-primary/[0.05] top-[10%] left-[5%]" delay={1} />
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal axis="y" className="text-center mb-20">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">06 — Contact</p>
            <h2 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-black text-foreground leading-[0.95] tracking-tight mb-6">
              Ready to cut<br />payroll time <Accent>by 90%?</Accent>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
              Most agencies are up and running within the same day. Drop us a message and we'll schedule a free demo.
            </p>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left — selling points */}
            <Reveal axis="left">
              <div className="space-y-6 mb-10">
                {[
                  { icon: CheckCircle2, label: 'Free demo — no commitment', sub: 'See PayCore live with your own data' },
                  { icon: Clock, label: 'Setup in under one hour', sub: 'Our team onboards you start to finish' },
                  { icon: ShieldCheck, label: 'HMRC-compliant from day one', sub: 'Built around UK financial year standards' },
                  { icon: Sparkles, label: 'Custom to your agency', sub: 'We adapt to your workflow, not the other way' },
                ].map(({ icon: Ic, label, sub }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl glass flex items-center justify-center shrink-0 mt-0.5">
                      <Ic className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-border/20">
                {[
                  { icon: Mail, label: 'harsh@firmflow.app', href: 'mailto:harsh@firmflow.app' },
                  { icon: MapPin, label: 'London, United Kingdom', href: null },
                ].map(({ icon: Ic, label, href }) => (
                  <a key={label} href={href ?? undefined}
                    className={`flex items-center gap-3 text-sm text-muted-foreground ${href ? 'hover:text-foreground transition-colors' : ''}`}>
                    <Ic className="w-4 h-4 text-primary/70" strokeWidth={1.5} /> {label}
                  </a>
                ))}
              </div>
            </Reveal>

            {/* Right — form */}
            <Reveal axis="right">
              <div className="glass-premium rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                    <Send className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">Book a Free Demo</p>
                    <p className="text-xs text-muted-foreground">We reply within 1 business hour</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1.5 block">First Name *</label>
                      <input type="text" placeholder="Jane"
                        value={formData.name.split(' ')[0]}
                        onChange={e => setFormData(f => ({ ...f, name: e.target.value + ' ' + f.name.split(' ').slice(1).join(' ') }))}
                        className="w-full h-10 px-4 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-muted-foreground/50" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1.5 block">Last Name</label>
                      <input type="text" placeholder="Smith"
                        className="w-full h-10 px-4 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-muted-foreground/50" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">Work Email *</label>
                    <input type="email" placeholder="jane@agency.co.uk"
                      value={formData.email}
                      onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                      className="w-full h-10 px-4 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-muted-foreground/50" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">Company Name *</label>
                    <input type="text" placeholder="Acme Staffing Ltd"
                      value={formData.company}
                      onChange={e => setFormData(f => ({ ...f, company: e.target.value }))}
                      className="w-full h-10 px-4 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-muted-foreground/50" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">How many contractors?</label>
                    <select
                      value={formData.contractors}
                      onChange={e => setFormData(f => ({ ...f, contractors: e.target.value }))}
                      className="w-full h-10 px-4 text-sm rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-muted-foreground appearance-none cursor-pointer">
                      <option value="">Select a range...</option>
                      <option>1 – 50 contractors</option>
                      <option>51 – 200 contractors</option>
                      <option>201 – 500 contractors</option>
                      <option>501 – 1,000 contractors</option>
                      <option>1,000+ contractors</option>
                    </select>
                  </div>
                  {formError && <p className="text-xs text-destructive text-center">{formError}</p>}
                  {formSuccess ? (
                    <div className="w-full rounded-xl h-12 flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Message sent! We'll be in touch shortly.
                    </div>
                  ) : (
                    <Button
                      disabled={formSubmitting}
                      onClick={async () => {
                        if (!formData.name || !formData.email || !formData.company) {
                          setFormError('Please fill in your name, email, and company.');
                          return;
                        }
                        setFormError('');
                        setFormSubmitting(true);
                        try {
                          const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
                          const res = await fetch(
                            `https://${projectId}.supabase.co/functions/v1/send-contact-email`,
                            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }
                          );
                          const data = await res.json();
                          if (res.ok) {
                            setFormSuccess(true);
                            setFormData({ name: '', email: '', company: '', contractors: '', message: '' });
                          } else {
                            setFormError(data.error || 'Something went wrong. Please try again.');
                          }
                        } catch {
                          setFormError('Network error. Please try again.');
                        } finally {
                          setFormSubmitting(false);
                        }
                      }}
                      className="w-full rounded-xl h-12 shadow-lg shadow-primary/20 gap-2 text-[15px] font-semibold">
                      {formSubmitting ? (
                        <><span className="animate-spin border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full w-4 h-4 inline-block" /> Sending...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Book My Free Demo</>
                      )}
                    </Button>
                  )}
                  <p className="text-[10px] text-muted-foreground text-center">
                    No commitment. No credit card. We reply within 1 business hour.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section className="py-28 px-6 bg-background border-t border-border/20">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl glass-premium overflow-hidden px-10 py-20 border-2 !border-primary/15">
            <div className="absolute inset-0 hero-mesh pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
              <span className="text-[clamp(6rem,18vw,16rem)] font-black text-primary/[0.03] leading-none whitespace-nowrap tracking-tighter">
                PayCore
              </span>
            </div>
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-10">
              <Reveal axis="left">
                <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-black text-foreground leading-[1] tracking-tight mb-3">
                  Start processing<br />payroll <Accent>today.</Accent>
                </h2>
                <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                  Upload your first timesheet and generate HMRC-compliant invoices in under two minutes.
                </p>
              </Reveal>
              <Reveal axis="right" className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
                <Button onClick={() => scrollTo('contact')} size="lg"
                  className="rounded-full px-8 h-12 shadow-lg shadow-primary/30 gap-2 w-full sm:w-auto">
                  Book a Demo <ArrowUpRight className="w-4 h-4" />
                </Button>
                <Button onClick={() => navigate('/auth')} size="lg" variant="outline"
                  className="rounded-full px-8 h-12 w-full sm:w-auto">
                  Sign In
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t border-border/20 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="PayCore" className="w-7 h-7 rounded-md object-contain" />
            <div className="leading-none">
              <span className="font-bold text-sm text-foreground">PayCore</span>
              <span className="text-muted-foreground text-xs ml-1.5 tracking-widest uppercase">by FirmFlow</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            {navLinks.map((l) => (
              <button key={l.label} onClick={() => scrollTo(l.href)} className="hover:text-foreground transition-colors">
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap justify-center">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
            
            <span className="hidden md:inline">·</span>
            <span>© {new Date().getFullYear()} FirmFlow Ltd</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
