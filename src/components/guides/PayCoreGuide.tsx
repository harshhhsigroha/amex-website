import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield, Building2, CreditCard, Users, MessageSquare,
  ChevronRight, CheckCircle2, AlertTriangle, Lock,
  BarChart3, FileText, UserCog, Palette, BookOpen,
  Megaphone, Activity, Zap, Timer, ListChecks, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Guide Section Data ───────────────────────────────────────────────────────

interface GuideStep {
  title: string;
  content: string | null;
  list?: { label: string; desc: string }[];
  tip?: string;
}

interface GuideSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  steps: GuideStep[];
}

const sections: GuideSection[] = [
  {
    id: 'overview',
    title: 'Platform Overview',
    icon: BarChart3,
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-200',
    steps: [
      {
        title: 'What is AMEX Outsourcing?',
        content:
          'AMEX Outsourcing is a multi-tenant payroll, invoicing, and timesheet platform built for recruitment agencies. The AMEX Team Portal (/paycore) is your internal command centre for managing all client agencies and platform health.',
      },
      {
        title: 'Three-tier architecture',
        content: null,
        list: [
          { label: 'AMEX Team (You)', desc: 'Manage agencies, billing, support, announcements, SLA tracking, and platform settings from /admin' },
          { label: 'Operators / Agencies', desc: 'Each agency logs in at /admin to generate invoices, process timesheets, manage candidates, and support their clients' },
          { label: 'End Users', desc: "Agencies' clients log in at /client for a read-only view of invoices, contractors, and support" },
        ],
      },
      {
        title: 'Dashboard overview',
        content:
          'The Overview tab shows key metrics: Total MRR, pending billing, open tickets, user counts, plan distribution charts, candidate limit alerts, and platform health indicators. All data refreshes automatically.',
      },
    ],
  },
  {
    id: 'clients',
    title: 'Managing Clients',
    icon: Building2,
    color: 'text-violet-600',
    bg: 'bg-violet-500/10',
    border: 'border-violet-200',
    steps: [
      {
        title: 'Adding a new client (agency)',
        content:
          'Go to Clients tab → click "Add Client". Enter the company name and UK address. This creates their account. They will not have login access until you create a Company Login under their Users panel.',
      },
      {
        title: 'Setting a billing plan',
        content:
          'Open the client detail panel → Plan tab. Select a pricing tier and set the number of candidates. The monthly fee is calculated automatically based on the pricing schedule.',
        tip: 'Volume plans auto-calculate based on live candidate count. The system shows you the real number of candidates the agency has onboarded.',
      },
      {
        title: 'Creating login access',
        content:
          "In the client's Company Logins tab, click 'Add' to create a login. Enter their name, email, and a strong temporary password. They log in at /auth/client.",
      },
      {
        title: 'Tool access permissions',
        content:
          "In the client's Tool Access tab, toggle which features the agency can use: Dashboard, Candidate Management, Invoice Generation, Self-Bill Generation, and History. These are enforced server-side.",
      },
      {
        title: 'Custom onboarding link',
        content:
          "Each client has an isolated candidate onboarding URL: /onboarding/{clientId}. Share this with the agency so candidates register directly to their account. The Onboarding tab also provides a QR code for easy sharing.",
      },
      {
        title: 'Candidate agency assignment',
        content:
          'Candidates in the master list can be assigned to a specific agency/invoice recipient via a dropdown populated from sub-clients. This links candidates to the correct invoice recipient for billing.',
      },
      {
        title: 'Client capabilities',
        content:
          'Each agency can: process timesheets with clock-in/out & GPS tracking, generate master invoices and self-billed invoices, manage candidates, configure onboarding forms, set invoice payment details, manage sub-clients, and support their own end-user clients.',
      },
    ],
  },
  {
    id: 'billing',
    title: 'Billing & Plans',
    icon: CreditCard,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-200',
    steps: [
      {
        title: 'Pricing tiers',
        content: null,
        list: [
          { label: 'Starter (1–200 candidates)', desc: '£4/candidate/month — ideal for small agencies starting out' },
          { label: 'Growth (201–1,000 candidates)', desc: '£3/candidate/month — best value for growing agencies' },
          { label: 'Scale (1,001+ candidates)', desc: '£2.50/candidate/month — includes free white-label branding' },
          { label: 'Team Plan', desc: 'Fixed £399/month — up to 100 users — best for internal teams' },
        ],
      },
      {
        title: 'Annual discount',
        content:
          'Clients on an annual billing cycle receive a 10% discount. Switch the billing cycle in the Plan tab — the system recalculates the fee automatically.',
      },
      {
        title: 'Auto-generating monthly invoices',
        content:
          "In the client's Billing tab, click 'Generate Monthly Invoice'. The system auto-fills the amount from their plan and live candidate count. Invoices are created with a due date 15 days from billing.",
        tip: 'You can also manually add bespoke invoices using the Manual Invoice button for one-off charges.',
      },
      {
        title: 'Marking invoices paid',
        content:
          'In the Billing tab, click the ✓ icon on any pending invoice to mark it as paid. This records the payment timestamp automatically.',
      },
    ],
  },
  {
    id: 'announcements',
    title: 'Announcements',
    icon: Megaphone,
    color: 'text-indigo-600',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-200',
    steps: [
      {
        title: 'Broadcasting to clients',
        content:
          'The Announcements tab lets you publish messages visible to all clients or specific tiers (Starter, Growth, Scale, Team). Use this for maintenance notices, feature announcements, or policy updates.',
      },
      {
        title: 'Priority levels',
        content: null,
        list: [
          { label: 'Info (blue)', desc: 'General updates and feature announcements' },
          { label: 'Warning (amber)', desc: 'Scheduled maintenance, upcoming changes' },
          { label: 'Critical (red)', desc: 'Urgent issues, outages, security alerts' },
        ],
      },
      {
        title: 'Managing announcements',
        content:
          'Toggle announcements active/inactive with the switch. Inactive announcements are hidden from clients but preserved for your records. Delete permanently with the trash icon.',
      },
    ],
  },
  {
    id: 'timeline',
    title: 'Activity Timeline',
    icon: Activity,
    color: 'text-cyan-600',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-200',
    steps: [
      {
        title: 'Platform-wide activity feed',
        content:
          'The Activity tab aggregates recent events from across the platform: invoices generated, support tickets created, new users linked, and audit log entries. Events are grouped by date with timestamps.',
      },
      {
        title: 'Filtering by client',
        content:
          'Use the client dropdown to filter the timeline to a specific agency. This gives you a CRM-style activity feed per client — useful for account reviews and troubleshooting.',
      },
    ],
  },
  {
    id: 'bulk',
    title: 'Bulk Actions',
    icon: Zap,
    color: 'text-orange-600',
    bg: 'bg-orange-500/10',
    border: 'border-orange-200',
    steps: [
      {
        title: 'Multi-select clients',
        content:
          'The Bulk Actions tab displays all clients as selectable cards. Click to toggle selection, or use "Select All" to target every client at once.',
      },
      {
        title: 'Available actions',
        content: null,
        list: [
          { label: 'Activate Plans', desc: 'Set selected clients\' plan status to active — useful for re-enabling after payment' },
          { label: 'Suspend Plans', desc: 'Suspend selected clients — they retain their data but lose portal access' },
        ],
      },
      {
        title: 'Executing',
        content:
          'Select an action from the dropdown, then click Execute. The system processes each client sequentially and shows a success toast with the count of affected clients.',
        tip: 'Always double-check your selection before executing. Suspension takes effect immediately.',
      },
    ],
  },
  {
    id: 'sla',
    title: 'SLA Tracking',
    icon: Timer,
    color: 'text-rose-600',
    bg: 'bg-rose-500/10',
    border: 'border-rose-200',
    steps: [
      {
        title: 'SLA targets by priority',
        content: null,
        list: [
          { label: 'Urgent', desc: '1 hour response target' },
          { label: 'High', desc: '4 hour response target' },
          { label: 'Medium', desc: '12 hour response target' },
          { label: 'Low', desc: '24 hour response target' },
        ],
      },
      {
        title: 'Compliance metrics',
        content:
          'The SLA Tracking tab shows: overall compliance rate, average response time, number of SLA breaches, and tickets awaiting first response. These are calculated from the last 100 tickets.',
      },
      {
        title: 'Per-ticket SLA status',
        content:
          'Each ticket shows a green checkmark (SLA met), red warning (SLA breached), or amber clock (pending). The response time and target are displayed inline.',
        tip: 'The first admin reply on a ticket is automatically recorded as the first response time for SLA calculation.',
      },
    ],
  },
  {
    id: 'checklist',
    title: 'Onboarding Checklist',
    icon: ListChecks,
    color: 'text-teal-600',
    bg: 'bg-teal-500/10',
    border: 'border-teal-200',
    steps: [
      {
        title: 'Purpose',
        content:
          'The Onboarding tab provides a step-by-step checklist for setting up new clients. It tracks progress across 8 key steps: plan assignment, user creation, white-label setup, permissions, onboarding forms, first candidate, first invoice, and end-user setup.',
      },
      {
        title: 'Auto-detection',
        content:
          'Click "Auto-detect" to automatically check which steps have been completed. The system queries the database to verify plan records, user links, white-label config, permissions, invoices, and portal users.',
      },
      {
        title: 'Manual toggle',
        content:
          'Click any step to manually mark it complete or incomplete. Completed steps show the timestamp and are visually checked off with a progress bar at the top.',
      },
    ],
  },
  {
    id: 'support',
    title: 'Support Tickets',
    icon: MessageSquare,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-200',
    steps: [
      {
        title: 'Viewing tickets',
        content:
          'The Support tab shows all tickets from all clients. Open tickets show a red badge in the navigation. Tickets auto-refresh every 15 seconds.',
      },
      {
        title: 'Responding',
        content:
          'Select a ticket to open the conversation. Type your reply and press Send (or Cmd+Enter). Your messages appear in blue on the right. Client messages appear on the left.',
      },
      {
        title: 'Status management',
        content:
          "Use the status dropdown to move between Open → In Progress → Resolved → Closed. Setting to 'Resolved' automatically timestamps the resolution.",
      },
      {
        title: 'SLA implications',
        content:
          'Your first reply on a ticket is recorded as the first response time. This feeds into SLA tracking metrics. Aim to respond within the priority-based target.',
      },
    ],
  },
  {
    id: 'whitelabel',
    title: 'White Label',
    icon: Palette,
    color: 'text-pink-600',
    bg: 'bg-pink-500/10',
    border: 'border-pink-200',
    steps: [
      {
        title: 'Enabling white label',
        content:
          "Open a client's detail panel → White Label tab. Toggle on, set the brand name, upload a logo, and choose primary/secondary colours.",
      },
      {
        title: 'Where it applies',
        content:
          'White-label settings apply to the Operations Portal sidebar, the End-User Portal, and generated PDF invoices/self-bills. The agency and their clients see custom branding instead of AMEX Outsourcing.',
      },
      {
        title: 'Removing AMEX Outsourcing branding',
        content:
          "Toggle 'Hide Powered By' in the white-label settings to remove the 'AMEX Outsourcing' footer from the client's portals. This is included free for Scale tier clients.",
      },
      {
        title: 'Custom domain',
        content:
          'Enter a custom domain in the White Label tab. The client needs to point a DNS A record to the provided IP. Custom domain routing is handled at the infrastructure level.',
      },
    ],
  },
  {
    id: 'security',
    title: 'UK Security & Compliance',
    icon: Shield,
    color: 'text-red-600',
    bg: 'bg-red-500/10',
    border: 'border-red-200',
    steps: [
      {
        title: 'GDPR & UK GDPR compliance',
        content:
          'AMEX Outsourcing meets UK GDPR requirements. Candidate personal data (name, NI number, bank details) is stored with Row Level Security (RLS) policies. Each agency can only access their own candidates.',
        tip: 'Never share candidate data between different agency accounts. The platform enforces this at the database level.',
      },
      {
        title: 'Audit log',
        content:
          'All significant admin actions are recorded in the Audit Log tab (Super Admins only). This log is immutable — records cannot be deleted or modified.',
      },
      {
        title: 'Role-based access',
        content: null,
        list: [
          { label: 'Super Admin', desc: 'Full access: team management, billing, audit logs, bulk actions, and all system settings' },
          { label: 'Admin', desc: 'Operational access with customisable permissions per team member' },
        ],
        tip: 'Never share Super Admin credentials. Create individual accounts for each team member.',
      },
      {
        title: 'Password policy',
        content:
          'All passwords must be at least 8 characters. When creating accounts for clients, use strong temporary passwords and instruct them to change on first login.',
      },
      {
        title: 'Data retention',
        content:
          'Under UK GDPR, personal data should not be retained longer than necessary. Review and archive old candidate records periodically. Invoice records must be retained for 6 years for UK tax compliance.',
      },
    ],
  },
  {
    id: 'team',
    title: 'Team Management',
    icon: UserCog,
    color: 'text-slate-600',
    bg: 'bg-slate-500/10',
    border: 'border-slate-200',
    steps: [
      {
        title: 'Adding team members',
        content:
          'Go to Team & Roles tab (Super Admin only). Enter the email of the person to add, select their role, and click Add. They receive an email to set their password.',
      },
      {
        title: 'Permissions',
        content:
          'Admin permissions can be customised per team member — toggle Invoice Generation, Candidate Management, Client Management, Dashboard Access, History, and Self-Bill Generation. Super Admins always have all permissions.',
      },
      {
        title: 'Client user management',
        content:
          'The Team & Roles tab also includes Client User Management where you can view, create, and delete client portal accounts across all agencies. You can also reset client passwords.',
      },
    ],
  },
];

// ── Component ────────────────────────────────────────────────────────────────

type SectionId = (typeof sections)[number]['id'];

export function PayCoreGuide() {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const current = sections.find(s => s.id === activeSection)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Platform Guide</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete reference for the AMEX Admin Portal — {sections.length} sections
        </p>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar nav */}
        <aside className="hidden lg:flex flex-col gap-1 w-52 shrink-0">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all',
                activeSection === s.id
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <s.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{s.title}</span>
              {activeSection === s.id && <ChevronRight className="h-3 w-3 shrink-0" />}
            </button>
          ))}
        </aside>

        {/* Mobile horizontal nav */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all shrink-0',
                activeSection === s.id
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Section header */}
          <div className={cn('flex items-center gap-3 p-4 rounded-xl border', current.border, current.bg)}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/80 shadow-sm">
              <current.icon className={cn('h-5 w-5', current.color)} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{current.title}</h3>
              <p className="text-xs text-muted-foreground">
                {current.steps.length} topic{current.steps.length !== 1 ? 's' : ''} in this section
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {current.steps.map((step, i) => (
              <Card key={i} className="border-border/50">
                <CardHeader className="pb-2 pt-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className={cn('h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0', current.bg)}>
                      <span className={current.color}>{i + 1}</span>
                    </div>
                    <CardTitle className="text-sm font-semibold">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-4 space-y-3">
                  {step.content && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.content}</p>
                  )}
                  {step.list && (
                    <div className="space-y-2">
                      {step.list.map((item, j) => (
                        <div key={j} className="flex gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                          <CheckCircle2 className={cn('h-4 w-4 shrink-0 mt-0.5', current.color)} />
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {step.tip && (
                    <div className="flex gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">{step.tip}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* UK compliance banner */}
          {current.id === 'security' && (
            <div className="flex gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">UK GDPR — Key Obligations</p>
                <p>
                  As a data processor, AMEX Outsourcing provides technical controls. As a data controller, your agency clients
                  are responsible for their GDPR obligations. Ensure clients have a published Privacy Policy and a
                  legal basis for processing candidate data.
                </p>
                <p>
                  Relevant legislation: UK GDPR (retained from EU GDPR), Data Protection Act 2018, Employment
                  Practices Code (ICO).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
