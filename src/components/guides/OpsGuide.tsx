import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  FileText, Users, Receipt, BarChart3, MessageSquare, UserCog,
  CheckCircle2, AlertTriangle, ChevronRight, BookOpen, Building2,
  Upload, Download, Settings2, Copy,
} from 'lucide-react';

const sections = [
  {
    id: 'overview',
    title: 'Getting Started',
    icon: BarChart3,
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-200',
    steps: [
      {
        title: 'Your Operations Portal',
        content: 'Welcome to your Operations Portal — the tool your agency uses to manage timesheets, generate invoices, manage candidates, produce self-billed remittances, and support your clients. Everything your team needs is in the left sidebar.',
      },
      {
        title: 'Dashboard overview',
        content: "The Dashboard gives you a live snapshot of this financial year's activity — total invoices generated, gross labour costs, VAT billed, and number of active contractors. Use it to monitor your weekly activity at a glance.",
      },
      {
        title: 'UK financial year',
        content: 'All invoices, timesheets, and self-bills follow the UK financial year (6 April – 5 April) and are tagged with the correct Financial Week number. You can filter all history views by financial year and week.',
      },
    ],
  },
  {
    id: 'timesheets',
    title: 'Timesheets',
    icon: FileText,
    color: 'text-cyan-600',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-200',
    steps: [
      {
        title: 'Daily timesheet management',
        content: 'The Timesheets section is the central hub for tracking candidate working hours. Timesheets are generated on a daily basis from clock-in/out records. Each entry shows the candidate, date, hours worked, hourly rate, and total amount.',
      },
      {
        title: 'Time Logs tab',
        content: 'The Time Logs tab shows all raw clock-in and clock-out records. You can filter by financial week and download individual candidate timesheets as PDF reports — including clock times, GPS addresses, and daily totals.',
        tip: 'Use the download dropdown to export per-person timesheet PDFs for any candidate in the selected week.',
      },
      {
        title: 'Timesheets tab',
        content: 'The Timesheets tab shows aggregated daily records per candidate. Each row represents one candidate\'s work on a specific date. You can approve, reject, or mark timesheets as pending.',
      },
      {
        title: 'Generating invoices from timesheets',
        content: 'Once timesheets are approved, you can generate Master Invoices and Self-Billed Invoices directly from the Timesheets tab. The system will prompt you to select a sub-client (bill-to) for master invoices. VAT at 20% is calculated automatically.',
        tip: 'Only approved timesheets are included in invoice generation. Make sure to approve all relevant entries before generating.',
      },
      {
        title: 'Files & storage',
        content: 'Every PDF generated from timesheets — whether a timesheet report, master invoice, or self-bill — is automatically saved to the Files tab under the correct financial week for easy retrieval.',
      },
    ],
  },
  {
    id: 'invoices',
    title: 'Master Invoices',
    icon: FileText,
    color: 'text-violet-600',
    bg: 'bg-violet-500/10',
    border: 'border-violet-200',
    steps: [
      {
        title: 'Two ways to generate',
        content: 'You can generate master invoices in two ways: (1) Upload an Excel timesheet via the Master Invoice tab, or (2) Generate directly from approved daily timesheets in the Timesheets section. Both methods produce the same branded PDF.',
      },
      {
        title: 'Upload & process (Excel method)',
        content: 'Go to Master Invoice in the sidebar → click "Upload Timesheet". Drag and drop your Excel file or click to browse. The system validates and parses the file automatically — any errors will be shown with the row number.',
        tip: 'Make sure all dates are in DD/MM/YYYY format and numeric columns have no currency symbols.',
      },
      {
        title: 'Selecting a client',
        content: 'After upload (or when generating from timesheets), you must select which client (your invoice recipient) this invoice is for. The client\'s details will appear on the generated PDF.',
      },
      {
        title: 'VAT calculation',
        content: 'VAT at 20% is automatically calculated on all labour costs. The invoice PDF shows gross, VAT, and grand total breakdowns per contractor and as an overall summary.',
      },
      {
        title: 'Generating the PDF',
        content: 'Enter or confirm the invoice number, then click "Generate PDF". The invoice is: downloaded to your browser, saved to Files, and recorded in Invoice History. The PDF is branded with your agency name and colours.',
        tip: 'Invoice numbers must be unique. The system suggests one for you — you can edit it if needed.',
      },
    ],
  },
  {
    id: 'selfbill',
    title: 'Self-Billed Invoices',
    icon: Receipt,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-200',
    steps: [
      {
        title: 'What is a self-billed invoice?',
        content: "A self-billed invoice (or remittance) is generated on behalf of each contractor. It shows what they are being paid for the day. The system generates one PDF per contractor, matching them to the Candidate Master by Employee ID.",
      },
      {
        title: 'Two generation methods',
        content: 'Like master invoices, self-bills can be generated from an Excel upload (via the Self-Billed tab) or directly from approved daily timesheets in the Timesheets section.',
      },
      {
        title: 'Upload the candidate master',
        content: 'Before generating self-bills, you need to upload the Candidate Master file — an Excel file with all candidate bank details and personal info. This is used to enrich each self-bill with the contractor\'s bank details and NI number.',
        tip: 'Keep the Candidate Master file up to date. Any missing candidates will cause their self-bill to be skipped.',
      },
      {
        title: 'Generate self-bills',
        content: 'After uploading both the timesheet and candidate master (or using approved timesheets), click "Generate Self-Bills". The system processes each entry, matches the contractor, and creates a numbered remittance PDF. All PDFs are downloaded as a batch and saved to Files.',
      },
    ],
  },
  {
    id: 'candidates',
    title: 'Candidate Management',
    icon: Users,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-200',
    steps: [
      {
        title: 'The candidate master list',
        content: 'The Candidates section shows all registered candidates for your agency. You can view, edit, and search by name or Employee ID. Bank details and NI numbers are stored securely here.',
        tip: 'Changes to bank details take effect on the next invoice run. Previous self-bills are not affected.',
      },
      {
        title: 'Onboarding new candidates',
        content: 'Go to Onboard Candidate in the sidebar. You can either fill in the form on their behalf, or share the self-service link so the candidate registers themselves. Their record is automatically created.',
      },
      {
        title: 'Your self-service onboarding link',
        content: "Your agency has a unique onboarding URL. Share it with candidates — it's pre-configured with your custom form. The link is shown in both Onboard Candidate and Onboarding Form sections.",
      },
      {
        title: 'Custom onboarding form',
        content: 'Go to Onboarding Form in the sidebar to customise what information you collect from candidates. You can enable/disable fields, mark them as required, and add your own custom questions.',
      },
    ],
  },
  {
    id: 'clients',
    title: 'Managing Your Clients',
    icon: Building2,
    color: 'text-rose-600',
    bg: 'bg-rose-500/10',
    border: 'border-rose-200',
    steps: [
      {
        title: 'My Clients',
        content: 'The My Clients section lists all your invoice recipients (the companies you bill). You can add, edit, and manage them here. When generating invoices, you select from this list.',
      },
      {
        title: 'End-user portal access',
        content: 'You can give your clients read-only portal access at /client so they can view their own invoices and contractors. Manage their login from My Clients — click on a client and use the End Users tab.',
      },
      {
        title: 'Client support',
        content: "Your clients can raise support tickets from their portal. You'll see these in Client Inbox. You can respond directly and manage the ticket status.",
      },
    ],
  },
  {
    id: 'files',
    title: 'Files & History',
    icon: FileText,
    color: 'text-teal-600',
    bg: 'bg-teal-500/10',
    border: 'border-teal-200',
    steps: [
      {
        title: 'Invoice History',
        content: 'The Invoice History tab shows all master invoices you have generated. You can filter by financial year and week, search by invoice number, and download the original PDFs.',
      },
      {
        title: 'Self-Bill History',
        content: 'The Self-Bill History tab shows all self-billed remittances generated for contractors. Filter by year and week to find specific records.',
      },
      {
        title: 'Files browser',
        content: 'The Files tab is your central document store. Every generated PDF — master invoices, self-bills, and timesheet reports — is automatically filed here under the correct financial week. You can also manually upload files.',
        tip: 'Use the financial week filter to quickly locate documents from a specific period.',
      },
    ],
  },
  {
    id: 'settings',
    title: 'Invoice Settings',
    icon: Settings2,
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
    border: 'border-purple-200',
    steps: [
      {
        title: 'Payment details',
        content: 'Go to Invoice Settings to configure the bank details that appear on your master invoices — bank name, sort code, account number, and VAT number. These are printed on every PDF you generate.',
      },
      {
        title: 'Self-bill address',
        content: 'You can also set the "Invoice To" company name and address used on self-billed invoices. This is your agency\'s own details that appear as the issuer on remittances.',
      },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    icon: MessageSquare,
    color: 'text-slate-600',
    bg: 'bg-slate-500/10',
    border: 'border-slate-200',
    steps: [
      {
        title: 'Getting help from AMEX Outsourcing',
        content: 'Use the Support tab to raise a ticket directly with the AMEX Outsourcing support team. Provide as much detail as possible including any error messages or invoice numbers.',
      },
      {
        title: 'Supporting your clients',
        content: "View and respond to tickets raised by your end users from the Client Inbox tab. You'll see all their queries and can reply in the chat interface.",
      },
    ],
  },
  {
    id: 'team',
    title: 'Team Access',
    icon: UserCog,
    color: 'text-indigo-600',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-200',
    steps: [
      {
        title: 'Adding team members',
        content: 'Go to Team Members in the sidebar. You can add staff to your agency account and control exactly which parts of the portal they can access.',
      },
      {
        title: 'Permissions',
        content: null,
        list: [
          { label: 'Dashboard', desc: 'View the analytics overview' },
          { label: 'Invoice Generation', desc: 'Upload timesheets and generate master invoices' },
          { label: 'Self-Billed Invoices', desc: 'Generate remittances for contractors' },
          { label: 'Candidate Management', desc: 'View and edit the candidate master list' },
          { label: 'Invoice History', desc: 'View past invoices, self-bills, and files' },
        ],
      },
      {
        title: 'Security reminder',
        content: 'Only share login credentials with authorised personnel. Each team member should have their own account. Avoid sharing passwords — contact AMEX Outsourcing support if you need to reset access.',
        tip: 'Team member accounts can be removed at any time if someone leaves.',
      },
    ],
  },
];

type SectionId = typeof sections[number]['id'];

export function OpsGuide() {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const current = sections.find(s => s.id === activeSection)!;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Operations Guide</h2>
        </div>
        <p className="text-sm text-muted-foreground">Step-by-step guide to using your Operations Portal</p>
      </div>

      <div className="flex gap-6">
        {/* Section nav — desktop */}
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

        {/* Mobile: scrollable chips */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 w-full">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all shrink-0',
                activeSection === s.id ? 'bg-primary text-primary-foreground font-medium' : 'bg-muted text-muted-foreground',
              )}
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className={cn('flex items-center gap-3 p-4 rounded-xl border', current.border, current.bg)}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/80 shadow-sm">
              <current.icon className={cn('h-5 w-5', current.color)} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{current.title}</h3>
              <p className="text-xs text-muted-foreground">{current.steps.length} topic{current.steps.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

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
                  {'tip' in step && step.tip && (
                    <div className="flex gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">{step.tip}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
