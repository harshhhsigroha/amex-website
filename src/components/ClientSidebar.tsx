import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Building2,
  FolderOpen,
  UserCog,
  Shield,
  ClipboardList,
  MessagesSquare,
  Headphones,
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
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  { title: 'Overview', value: 'overview', icon: LayoutDashboard },
  { title: 'Invoices', value: 'invoices', icon: FileText },
  { title: 'Contractors', value: 'candidates', icon: Users },
  { title: 'Files', value: 'files', icon: FolderOpen },
];

const managementNavItems: NavItem[] = [
  { title: 'My Clients', value: 'clients', icon: Building2 },
  { title: 'End Users', value: 'end_users', icon: UserCog },
  { title: 'Onboarding', value: 'onboarding', icon: ClipboardList },
];

const supportNavItems: NavItem[] = [
  { title: 'Support', value: 'support_paycore', icon: Headphones },
  { title: 'Client Inbox', value: 'support_clients', icon: MessagesSquare },
];

const accountNavItems: NavItem[] = [
  { title: 'Admin Team', value: 'admins', icon: Shield },
];

interface ClientSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  companyName?: string;
}

export function ClientSidebar({ activeTab, onTabChange, companyName }: ClientSidebarProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const renderNavGroup = (items: NavItem[], label: string) => {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
          {label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.value}>
                <SidebarMenuButton
                  isActive={activeTab === item.value}
                  onClick={() => onTabChange(item.value)}
                  tooltip={item.title}
                  className={cn(
                    'transition-all duration-200',
                    activeTab === item.value && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      {/* Header */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm shrink-0">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate">
                {companyName || 'Client Portal'}
              </h1>
              <p className="text-[10px] text-muted-foreground">Operations Portal</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <Separator className="mx-2" />

      {/* Navigation */}
      <SidebarContent className="px-2 py-2">
        {renderNavGroup(mainNavItems, 'Main')}
        {renderNavGroup(managementNavItems, 'Management')}
        {renderNavGroup(supportNavItems, 'Support')}
        {renderNavGroup(accountNavItems, 'Account')}
      </SidebarContent>

      <Separator className="mx-2" />

      {/* Footer */}
      <SidebarFooter className="p-3">
        {!isCollapsed && (
          <div className="mb-2 px-2">
            <p className="text-xs font-medium text-foreground truncate">{user?.email}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Shield className="h-2.5 w-2.5 text-primary" />
              <span className="text-primary font-medium">Admin</span>
            </p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Sign Out"
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
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
