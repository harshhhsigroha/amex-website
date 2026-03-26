import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

// ── Feature panels ───────────────────────────────────────────────────────────
import { PayCoreDashboard } from '@/components/paycore/PayCoreDashboard';
import { PayCoreClientManager } from '@/components/paycore/ClientManager';
import { PayCoreSupportPanel } from '@/components/paycore/PayCoreSupportPanel';
import { AnnouncementsPanel } from '@/components/paycore/AnnouncementsPanel';
import { ClientActivityTimeline } from '@/components/paycore/ClientActivityTimeline';
import { BulkActionsPanel } from '@/components/paycore/BulkActionsPanel';
import { SLATrackingPanel } from '@/components/paycore/SLATrackingPanel';
import { OnboardingChecklistPanel } from '@/components/paycore/OnboardingChecklistPanel';
import { AuditLog } from '@/components/paycore/AuditLog';
import { DailyLogPanel } from '@/components/paycore/DailyLogPanel';
import { PayCoreGuide } from '@/components/guides/PayCoreGuide';
import AdminPanel from '@/components/AdminPanel';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { PullToRefresh } from '@/components/ui/PullToRefresh';

// ── UI ───────────────────────────────────────────────────────────────────────
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard, Building2, MessageSquare, Users, Settings,
  LogOut, Shield, ClipboardList, BookOpen, Megaphone, Activity,
  Zap, Timer, ListChecks, CalendarDays, MoreHorizontal, Bell,
} from 'lucide-react';

// ── Tab configuration ────────────────────────────────────────────────────────

type Tab =
  | 'overview' | 'clients' | 'support'
  | 'announcements' | 'timeline' | 'bulk' | 'sla' | 'checklist'
  | 'audit' | 'daily-log' | 'team' | 'guide' | 'settings';

interface TabGroup {
  label: string;
  items: { id: Tab; label: string; icon: React.ElementType }[];
}

const TAB_GROUPS: TabGroup[] = [
  {
    label: 'Core',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'clients', label: 'Clients', icon: Building2 },
      { id: 'support', label: 'Support', icon: MessageSquare },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'announcements', label: 'Announcements', icon: Megaphone },
      { id: 'timeline', label: 'Activity', icon: Activity },
      { id: 'bulk', label: 'Bulk Actions', icon: Zap },
      { id: 'sla', label: 'SLA Tracking', icon: Timer },
      { id: 'checklist', label: 'Onboarding', icon: ListChecks },
    ],
  },
  {
    label: 'Admin',
    items: [
      { id: 'audit', label: 'Audit Log', icon: ClipboardList },
      { id: 'daily-log', label: 'Daily Log', icon: CalendarDays },
      { id: 'team', label: 'Team & Roles', icon: Users },
      { id: 'guide', label: 'Guide', icon: BookOpen },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap(g => g.items);

// ── Main component ───────────────────────────────────────────────────────────

export default function PayCoreAdmin() {
  const { user, loading, isSuperAdmin, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const isMobile = useIsMobile();

  const allTabIds = useMemo(() => ALL_TABS.map(t => t.id), []);

  const goToAdjacentTab = useCallback((dir: 'left' | 'right') => {
    const idx = allTabIds.indexOf(activeTab);
    const next = dir === 'left'
      ? Math.min(idx + 1, allTabIds.length - 1)
      : Math.max(idx - 1, 0);
    if (next !== idx) {
      setSwipeDirection(dir);
      if ('vibrate' in navigator) navigator.vibrate(10);
      setActiveTab(allTabIds[next]);
    }
  }, [activeTab, allTabIds]);

  useSwipeNavigation({
    onSwipeLeft: () => goToAdjacentTab('left'),
    onSwipeRight: () => goToAdjacentTab('right'),
    threshold: 60,
    enabled: isMobile,
  });

  // Live open-ticket count for badge
  const { data: openTickets = 0 } = useQuery({
    queryKey: ['open_ticket_count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress']);
      return count || 0;
    },
    refetchInterval: 30000,
  });

  const handlePullRefresh = useCallback(async () => {
    await queryClient.invalidateQueries();
  }, [queryClient]);

  // Auth guard
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/');
  }, [user, loading, isAdmin, navigate]);

  if (loading) return <LoadingScreen />;
  if (!user || !isAdmin) return null;

  const handleSignOut = () => signOut().then(() => navigate('/'));

  // ── Content router ───────────────────────────────────────────────────────

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':      return <PayCoreDashboard />;
      case 'clients':       return <PayCoreClientManager />;
      case 'support':       return <PayCoreSupportPanel />;
      case 'announcements': return <AnnouncementsPanel />;
      case 'timeline':      return <ClientActivityTimeline />;
      case 'bulk':          return <BulkActionsPanel />;
      case 'sla':           return <SLATrackingPanel />;
      case 'checklist':     return <OnboardingChecklistPanel />;
      case 'audit':
        return isSuperAdmin
          ? <AuditLog />
          : <RestrictedMessage text="Super Admin access required to view audit logs." />;
      case 'daily-log':
        return <DailyLogPanel />;
      case 'team':
        return isSuperAdmin
          ? <AdminPanel />
          : <RestrictedMessage text="Super Admin access required to manage team members." />;
      case 'guide':    return <PayCoreGuide />;
      case 'settings': return <SettingsPanel email={user.email!} onSignOut={handleSignOut} />;
    }
  };

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex w-full bg-background bg-mesh">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 glass-sidebar sticky top-0 h-screen overflow-y-auto">
        <SidebarBrand />

        <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
          {TAB_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium px-3 pt-1 pb-1">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(tab => (
                  <NavButton
                    key={tab.id}
                    tab={tab}
                    active={activeTab === tab.id}
                    badge={tab.id === 'support' && openTickets > 0 ? openTickets : undefined}
                    onClick={() => setActiveTab(tab.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <SidebarFooter email={user.email!} role={isSuperAdmin ? 'Super Admin' : 'Admin'} onSignOut={handleSignOut} />
      </aside>

      {/* Mobile header */}
      <MobileHeader
        activeTab={activeTab}
        openTickets={openTickets}
        onTabChange={setActiveTab}
      />

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title={ALL_TABS.find(t => t.id === activeTab)?.label || ''}
          openTickets={openTickets}
          onSupportClick={() => setActiveTab('support')}
        />

        <PullToRefresh onRefresh={handlePullRefresh} className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto lg:mt-0 mt-14 pb-20 lg:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={isMobile && swipeDirection ? { opacity: 0, x: swipeDirection === 'left' ? 80 : -80 } : { opacity: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={isMobile && swipeDirection ? { opacity: 0, x: swipeDirection === 'left' ? -80 : 80 } : { opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="max-w-7xl mx-auto"
              onAnimationComplete={() => setSwipeDirection(null)}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </PullToRefresh>

        <footer className="hidden lg:block glass-header border-t border-b-0 px-6 py-3">
          <p className="text-xs text-muted-foreground text-center">
            AMEX Admin Portal by AMEX Outsourcing • Internal Use Only
          </p>
        </footer>
      </main>

      {/* Mobile bottom navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        openTickets={openTickets}
        onTabChange={setActiveTab}
      />
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SidebarBrand() {
  return (
    <div className="p-5 border-b border-border/30">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/20">
          <Shield className="h-4.5 w-4.5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none text-foreground">AMEX Outsourcing</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Admin Portal</p>
        </div>
      </div>
    </div>
  );
}

function NavButton({
  tab,
  active,
  badge,
  onClick,
}: {
  tab: { id: Tab; label: string; icon: React.ElementType };
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
        active
          ? 'bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 backdrop-blur-sm'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:backdrop-blur-sm'
      }`}
    >
      <tab.icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">{tab.label}</span>
      {badge !== undefined && badge > 0 && (
        <Badge variant="destructive" className="text-[9px] h-4 min-w-4 px-1">{badge}</Badge>
      )}
    </button>
  );
}

function SidebarFooter({
  email,
  role,
  onSignOut,
}: {
  email: string;
  role: string;
  onSignOut: () => void;
}) {
  return (
    <div className="p-3 border-t border-border/30">
      <div className="px-3 py-2 mb-1 glass-subtle rounded-xl">
        <p className="text-xs font-medium text-foreground truncate">{email}</p>
        <Badge variant="outline" className="text-[9px] mt-1 border-primary/30 text-primary backdrop-blur-sm">
          {role}
        </Badge>
      </div>
      <button
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10 transition-colors"
        onClick={onSignOut}
      >
        <LogOut className="h-3.5 w-3.5" />Sign Out
      </button>
    </div>
  );
}

function MobileHeader({
  activeTab,
  openTickets,
  onTabChange,
}: {
  activeTab: Tab;
  openTickets: number;
  onTabChange: (tab: Tab) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentTab = ALL_TABS.find(t => t.id === activeTab);

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-header px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-sm text-foreground">AMEX Outsourcing</span>
              <span className="text-[10px] text-muted-foreground block leading-none">{currentTab?.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onTabChange('support'); setMenuOpen(false); }}
              className="relative h-9 w-9 rounded-xl flex items-center justify-center bg-accent/50 text-foreground"
            >
              <Bell className="h-4 w-4" />
              {openTickets > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center animate-scale-in">
                  {openTickets}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="h-9 w-9 rounded-xl flex items-center justify-center bg-accent/50 text-foreground"
            >
              {menuOpen ? <span className="text-lg">✕</span> : <span className="text-lg">☰</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile slide-up menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="relative mt-16 mx-3 mb-3 flex-1 overflow-y-auto rounded-2xl glass-card p-3 space-y-2 max-h-[80vh]">
            {TAB_GROUPS.map(group => (
              <div key={group.label}>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium px-3 pt-2 pb-1">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { onTabChange(tab.id); setMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary/90 text-primary-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent/50'
                      }`}
                    >
                      <tab.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left">{tab.label}</span>
                      {tab.id === 'support' && openTickets > 0 && (
                        <Badge variant="destructive" className="text-[9px] h-4 min-w-4 px-1">{openTickets}</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function TopBar({
  title,
  openTickets,
  onSupportClick,
}: {
  title: string;
  openTickets: number;
  onSupportClick: () => void;
}) {
  return (
    <header className="hidden lg:flex items-center justify-between glass-header px-6 py-4 sticky top-0 z-10">
      <div>
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground">AMEX Outsourcing Client Management Portal</p>
      </div>
      {openTickets > 0 && (
        <button
          onClick={onSupportClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
          {openTickets} open ticket{openTickets !== 1 ? 's' : ''}
        </button>
      )}
    </header>
  );
}

function SettingsPanel({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  return (
    <div className="max-w-xl space-y-4">
      <div className="p-6 rounded-2xl glass-card space-y-3">
        <h3 className="font-semibold text-sm text-destructive">Sign Out</h3>
        <p className="text-xs text-muted-foreground">You are signed in as {email}</p>
        <Button size="sm" variant="destructive" onClick={onSignOut} className="gap-2">
          <LogOut className="h-4 w-4" />Sign Out
        </Button>
      </div>
    </div>
  );
}

const BOTTOM_NAV_TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: Building2 },
  { id: 'support', label: 'Support', icon: MessageSquare },
  { id: 'timeline', label: 'Activity', icon: Activity },
];

function MobileBottomNav({
  activeTab,
  openTickets,
  onTabChange,
}: {
  activeTab: Tab;
  openTickets: number;
  onTabChange: (tab: Tab) => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const isBottomTab = BOTTOM_NAV_TABS.some(t => t.id === activeTab);
  const otherTabs = ALL_TABS.filter(t => !BOTTOM_NAV_TABS.some(bt => bt.id === t.id));

  return (
    <>
      {/* More menu overlay */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex items-end">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
          <div className="relative w-full mx-2 mb-[4.5rem] max-h-[60vh] overflow-y-auto rounded-2xl glass-card p-2 space-y-0.5">
            {otherTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { onTabChange(tab.id); setMoreOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary/90 text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50'
                }`}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.id === 'support' && openTickets > 0 && (
                  <Badge variant="destructive" className="text-[9px] h-4 min-w-4 px-1">{openTickets}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-header border-t border-border/30 px-1 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around relative">
          {BOTTOM_NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if ('vibrate' in navigator) navigator.vibrate(10);
                onTabChange(tab.id);
                setMoreOpen(false);
              }}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-colors relative ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <motion.div
                key={`icon-${tab.id}-${activeTab === tab.id}`}
                initial={activeTab === tab.id ? { scale: 0.7, y: 4 } : false}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <tab.icon className="h-5 w-5" />
              </motion.div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.span
                  layoutId="bottomNavIndicator"
                  className="absolute -top-px left-3 right-3 h-0.5 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {tab.id === 'support' && openTickets > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              )}
            </button>
          ))}
          <button
            onClick={() => {
              if ('vibrate' in navigator) navigator.vibrate(10);
              setMoreOpen(!moreOpen);
            }}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-colors relative ${
              moreOpen || !isBottomTab ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <motion.div
              animate={{ rotate: moreOpen ? 90 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <MoreHorizontal className="h-5 w-5" />
            </motion.div>
            <span className="text-[10px] font-medium">More</span>
            {(moreOpen || !isBottomTab) && (
              <motion.span
                layoutId="bottomNavIndicator"
                className="absolute -top-px left-3 right-3 h-0.5 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}

function RestrictedMessage({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
      {text}
    </div>
  );
}
