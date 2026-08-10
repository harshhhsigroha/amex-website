import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight, ChevronDown, Building2, Users, Phone, Mail, Scale, FileText, Briefcase, Hammer, HeartPulse, Utensils, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

const navLinks = [
  { label: 'About', href: '/about' },
  { label: 'Process', href: '/process' },
  { label: 'Contact', href: '/contact' },
];

const serviceLinks = [
  { icon: Scale, label: 'Employment Status', href: '/services/employment-status' },
  { icon: FileText, label: 'Payroll Services', href: '/services/payroll-services' },
  { icon: Briefcase, label: 'HR Services', href: '/services/hr-services' },
];

const industryLinks = [
  { icon: Hammer, label: 'Construction', href: '/industries/construction' },
  { icon: HeartPulse, label: 'Healthcare', href: '/industries/healthcare' },
  { icon: Utensils, label: 'Hospitality', href: '/industries/hospitality' },
  { icon: Truck, label: 'Logistics', href: '/industries/logistics' },
];

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileIndustriesOpen, setMobileIndustriesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const industriesDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
      if (industriesDropdownRef.current && !industriesDropdownRef.current.contains(e.target as Node)) {
        setIndustriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden font-sans">
      {/* NAV */}
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
            {/* Services dropdown */}
            <div ref={dropdownRef} className="relative">
              <button onClick={() => setServicesOpen(!servicesOpen)}
                className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/60 flex items-center gap-1">
                Services <ChevronDown className={`w-3 h-3 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="py-2">
                      {serviceLinks.map(s => (
                        <button key={s.label} onClick={() => { setServicesOpen(false); navigate(s.href); }}
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
              <button onClick={() => setIndustriesOpen(!industriesOpen)}
                className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/60 flex items-center gap-1">
                Industries <ChevronDown className={`w-3 h-3 transition-transform ${industriesOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {industriesOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="py-2">
                      {industryLinks.map(s => (
                        <button key={s.label} onClick={() => { setIndustriesOpen(false); navigate(s.href); }}
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth/admin')} className="hidden sm:flex text-muted-foreground text-[13px]">
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
                transition={{ delay: 0.1 }}
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
              {navLinks.filter(l => l.label !== 'About').map((l, i) => (
                <motion.button key={l.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (i + 3) * 0.05 }} onClick={() => { setMenuOpen(false); navigate(l.href); }}
                  className="flex items-center justify-between w-full px-4 py-3.5 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                  {l.label}<ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </motion.button>
              ))}
              <div className="h-px bg-border/40 my-2" />
              {[
                { label: 'Admin Portal', route: '/auth/admin' },
                { label: 'Client Portal', route: '/auth/client' },
              ].map((item, i) => (
                <motion.button key={item.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navLinks.length + i + 1) * 0.05 }}
                  onClick={() => { setMenuOpen(false); navigate(item.route); }}
                  className="flex items-center justify-between w-full px-4 py-3.5 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-xl transition-colors">
                  {item.label}<ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENT */}
      <main className="pt-24">{children}</main>

      {/* FOOTER */}
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
              <p className="text-xs text-muted-foreground">545 Northumberland Avenue, Reading, England, RG2 8NU</p>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground uppercase tracking-widest mb-4">Quick Links</p>
              <div className="space-y-2.5">
                {[{ label: 'About', href: '/about' }, { label: 'Process', href: '/process' }, { label: 'Contact', href: '/contact' }].map(l => (
                  <button key={l.label} onClick={() => navigate(l.href)}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground uppercase tracking-widest mb-4">Services</p>
              <div className="space-y-2.5">
                {serviceLinks.map(s => (
                  <button key={s.label} onClick={() => navigate(s.href)}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{s.label}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground uppercase tracking-widest mb-4">Portal Login</p>
              <div className="space-y-3">
                <Button variant="outline" size="sm" onClick={() => navigate('/auth/admin')}
                  className="w-full justify-start gap-2 rounded-xl text-sm">
                  <Building2 className="w-4 h-4 text-primary" /> Admin Portal
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/auth/client')}
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
