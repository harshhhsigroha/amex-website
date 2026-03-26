import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Building2,
  Users,
  History,
  FileStack,
  Shield,
  LogOut,
  HelpCircle,
  FolderOpen,
  UserCog,
  MessageSquare,
  Inbox,
  ChevronRight,
  Settings2,
  Clock,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminPermissions, AdminPermissions } from '@/hooks/useAdminPermissions';
import { useWhiteLabel } from '@/hooks/useWhiteLabel';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface NavItem {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: keyof AdminPermissions;
  superAdminOnly?: boolean;
  clientOnly?: boolean;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', value: 'dashboard', icon: LayoutDashboard, permission: 'can_view_dashboard' },
  { title: 'Timesheets', value: 'timesheets', icon: Clock, clientOnly: true },
  { title: 'Master Invoice', value: 'create', icon: FileText, permission: 'can_generate_invoices' },
  { title: 'Self-Billed', value: 'selfbill', icon: Receipt, permission: 'can_generate_self_bills' },
];

const managementNavItems: NavItem[] = [
  { title: 'Clients', value: 'clients', icon: Building2, permission: 'can_manage_clients' },
  { title: 'My Clients', value: 'my_clients', icon: Building2, clientOnly: true },
  { title: 'Candidates', value: 'candidates', icon: Users, permission: 'can_manage_candidates' },
  { title: 'Onboard Candidate', value: 'onboard-candidates', icon: UserCog, clientOnly: true },
  { title: 'Onboarding Form', value: 'onboarding-form', icon: Settings2, clientOnly: true },
  { title: 'Invoice Settings', value: 'invoice-settings', icon: Settings2, clientOnly: true },
];

const historyNavItems: NavItem[] = [
  { title: 'Invoice History', value: 'history', icon: History, permission: 'can_view_history' },
  { title: 'Self-Bill History', value: 'selfbill-history', icon: FileStack, permission: 'can_view_history' },
  { title: 'Files', value: 'files', icon: FolderOpen, permission: 'can_view_history' },
];

const supportNavItems: NavItem[] = [
  { title: 'Support', value: 'support', icon: MessageSquare },
];

const teamNavItems: NavItem[] = [
  { title: 'Team Members', value: 'team', icon: UserCog, clientOnly: true },
];

const adminNavItems: NavItem[] = [
  { title: 'Admin Panel', value: 'admin', icon: Shield, superAdminOnly: true },
];

const guideNavItems: NavItem[] = [
  { title: 'Guide', value: 'guide', icon: HelpCircle },
];


interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const navigate = useNavigate();
  const { user, isSuperAdmin, isClient, role, signOut } = useAuth();
  const { hasPermission } = useAdminPermissions();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Resolve client_id for white label lookup
  const [clientId, setClientId] = useState<string | null>(null);
  useEffect(() => {
    if (!isClient || !user) return;
    supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setClientId(data?.client_id ?? null));
  }, [isClient, user]);

  const { whiteLabel } = useWhiteLabel(clientId);

  const handleSignOut = async () => {
    await signOut();
    navigate(isClient ? '/auth/client' : '/auth/team');
  };

  const canAccessItem = (item: NavItem) => {
    if (item.clientOnly) return isClient;
    if (item.superAdminOnly) return isSuperAdmin;
    if (item.permission) return hasPermission(item.permission);
    return true;
  };

  const roleLabel = isClient ? 'Operator' : role === 'super_admin' ? 'Super Admin' : 'Admin';
  const initials = (user?.email || '?').slice(0, 2).toUpperCase();
  const brandName = whiteLabel?.brand_name || 'AMEX Outsourcing';
  const logoUrl = whiteLabel?.logo_url || '/logo.png';

  const renderNavGroup = (items: NavItem[], label: string) => {
    const accessibleItems = items.filter(canAccessItem);
    if (accessibleItems.length === 0) return null;

    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground/60 px-3 mb-1">
          {label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {accessibleItems.map((item) => {
              const isActive = activeTab === item.value;
              return (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => onTabChange(item.value)}
                    tooltip={item.title}
                    className={cn(
                      'group/item relative h-9 rounded-lg transition-all duration-150',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent'
                    )}
                  >
                    <item.icon className={cn(
                      'h-4 w-4 shrink-0 transition-colors duration-150',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover/item:text-foreground',
                    )} />
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1 min-w-[16px]">
                        {item.badge}
                      </Badge>
                    )}
                    {isActive && (
                      <ChevronRight className="ml-auto h-3 w-3 text-primary/70" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border glass-sidebar">
      {/* Header */}
      <SidebarHeader className="p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img src={logoUrl} alt={brandName} className="h-9 w-9 rounded-xl object-contain" />
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-sidebar" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-foreground tracking-tight">{brandName}</h1>
              {(!whiteLabel || !whiteLabel.hide_powered_by) && (
                <p className="text-[10px] text-muted-foreground">{whiteLabel ? 'Powered AMEX Outsourcing' : 'AMEX Outsourcing'}</p>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>

      <Separator className="mx-3 w-auto" />

      {/* Navigation */}
      <SidebarContent className="px-2 py-3 gap-1">
        {renderNavGroup(mainNavItems, 'Workspace')}
        {renderNavGroup(managementNavItems, 'Management')}
        {renderNavGroup(historyNavItems, 'History')}
        {renderNavGroup(teamNavItems, 'Team')}
        {renderNavGroup(supportNavItems, 'Support')}
        {renderNavGroup(adminNavItems, 'Administration')}
        {renderNavGroup(guideNavItems, 'Help')}
      </SidebarContent>

      <Separator className="mx-3 w-auto" />

      {/* Footer */}
      <SidebarFooter className="p-3">
        {!isCollapsed && (
          <div className="mb-2 px-2 py-2 rounded-xl glass-subtle">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{user?.email}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[10px] text-muted-foreground">{roleLabel}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Sign Out"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-9 rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
