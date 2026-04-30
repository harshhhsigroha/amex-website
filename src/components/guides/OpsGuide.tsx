import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  FileText, Users, Receipt, BarChart3, MessageSquare, UserCog,
  CheckCircle2, AlertTriangle, ChevronRight, BookOpen,
  Upload, Download, Settings2, Clock, ListChecks,
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
        content: 'Welcome to your Operations Portal — your central hub for managing timesheets, generating invoices, managing candidates, producing self-billed remittances, and communicating with AMEX Outsourcing. Everything you need is in the left sidebar.',
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
    icon: Clock,
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
        content: 'Once timesheets are approved, you can generate Master Invoices and Self-Billed Invoices directly from the Timesheets tab. The system will prompt you to select a client (bill-to) for master invoices. VAT at 20% is calculated automatically.',
        tip: 'Only approved timesheets are included in invoice generation. Make sure to approve all relevant entries before generating.',
      },
      {
        title: 'Files & storage',
        content: 'Every PDF generated — whether a timesheet report, master invoice, or self-bill — is automatically saved to the Files tab under the correct financial week for easy retrieval.',
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
        content: 'After upload (or when generating from timesheets), you must select which client this invoice is for. The client\'s details will appear on the generated PDF.',
      },
      {
        title: 'VAT calculation',
        content: 'VAT at 20% is automatically calculated on all labour costs. The invoice PDF shows gross, VAT, and grand total breakdowns per contractor and as an overall summary.',
      },
      {
        title: 'Generating the PDF',
        content: 'Enter or confirm the invoice number, then click "Generate PDF". The invoice is: downloaded to your browser, saved to Files, and recorded in Invoice History. The PDF is branded with your company name and colours.',
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
        content: "A self-billed invoice (or remittance) is generated on behalf of each contractor. It shows what they are being paid for the period. The system generates one PDF per contractor, matching them to the Candidate Master by Employee ID.",
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
        content: 'The Candidates section shows all registered candidates. You can view, edit, and search by name or Employee ID. Bank details and NI numbers are stored securely here.',
        tip: 'Changes to bank details take effect on the next invoice run. Previous self-bills are not affected.',
      },
      {
        title: 'Onboarding new candidates',
        content: 'Go to Onboard Candidate in the sidebar. You can either fill in the form on their behalf, or share the self-service onboarding link so the candidate registers themselves. Their record is automatically created.',
      },
      {
        title: 'Your self-service onboarding link',
        content: "Your account has a unique onboarding URL. Share it with candidates — it's pre-configured with your custom form fields. The link is shown in the Onboard Candidate section.",
      },
      {
        title: 'Custom onboarding form',
        content: 'Go to Onboarding Form in Settings to customise what information you collect from candidates. You can enable/disable fields, mark them as required, and add your own custom questions.',
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
        content: 'The Files tab is your central document store. Every generated PDF — master invoices, self-bills, and timesheet reports — is automatically filed here under the correct financial year and week. You can also manually upload files.',
        tip: 'Use the financial year and week filters to quickly locate documents from a specific period. Files are always sorted by financial week.',
      },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings2,
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
    border: 'border-purple-200',
    steps: [
      {
        title: 'Invoice payment details',
        content: 'Go to Invoice Settings to configure the bank details that appear on your master invoices — bank name, sort code, account number, and VAT number. These are printed on every PDF you generate.',
      },
      {
        title: 'Self-bill address',
        content: 'You can also set the "Invoice To" company name and address used on self-billed invoices. This is your company\'s details that appear as the issuer on remittances.',
      },
      {
        title: 'Onboarding form builder',
        content: 'Customise the fields on your candidate onboarding form. Toggle fields on/off, mark them as required, and add custom questions to suit your business needs.',
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
        title: 'Getting help',
        content: 'Use the Support tab to raise a ticket directly with the AMEX Outsourcing team. Provide as much detail as possible including any error messages or invoice numbers.',
      },
      {
        title: 'Client Inbox',
        content: "View and respond to tickets raised by your end users from the Client Inbox tab. You'll see all their queries and can reply in the chat interface.",
      },
    ],
  },
  {
    id: 'team',
    title: 'Team Management',
    icon: UserCog,
    color: 'text-indigo-600',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-200',
    steps: [
      {
        title: 'Adding team members',
        content: 'Go to Team in the sidebar. You can add staff to your account and control exactly which parts of the portal they can access.',
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
        content: 'Each team member should have their own account. Avoid sharing passwords — contact AMEX Outsourcing support if you need to reset access.',
        tip: 'Team member accounts can be removed at any time if someone leaves.',
      },
    ],
  },
  {
    id: 'playbook',
    title: 'Playbook',
    icon: ListChecks,
    color: 'text-rose-600',
    bg: 'bg-rose-500/10',
    border: 'border-rose-200',
    steps: [
      {
        title: 'Weekly payroll run — full workflow',
        content: 'A complete end-to-end run for one financial week. Follow each step in order; the whole cycle typically takes 30–60 minutes depending on candidate volume.',
        list: [
          { label: '1. Verify clock data', desc: 'Open Timesheets → Time Logs. Filter by the current financial week. Confirm every candidate has both clock-in and clock-out entries; chase anyone missing data.' },
          { label: '2. Approve daily timesheets', desc: 'Switch to the Timesheets tab. Review hours and rates per candidate per day. Click Approve on each correct row; reject and notify the candidate for any disputed entries.' },
          { label: '3. Generate Master Invoices', desc: 'From Timesheets, click Generate Invoices. Pick the bill-to client. The system creates one master invoice per client containing all approved hours, with VAT at 20% applied automatically.' },
          { label: '4. Generate Self-Bills', desc: 'From Timesheets, click Generate Self-Bills. The system matches each candidate by Employee ID and produces one remittance PDF per candidate, including bank details from the Candidate Master.' },
          { label: '5. Review history & files', desc: 'Open Invoice History and Self-Bill History to confirm all PDFs were created. All files are auto-saved to Files under the correct financial week.' },
          { label: '6. Send remittances', desc: 'Download the self-bill PDFs from Files and email them to candidates, or share via your usual distribution channel.' },
          { label: '7. Send invoices to clients', desc: 'Download master invoices from Invoice History and email them to the relevant client AP contact, copying any internal stakeholders.' },
        ],
        tip: 'Run the workflow on the same day each week (typically Monday for the prior Sun-Sat period) to keep the cadence predictable for clients and candidates.',
      },
      {
        title: 'Onboarding a new client — first 14 days',
        content: 'A repeatable checklist for taking a new client live. Each item maps directly to a portal action.',
        list: [
          { label: 'Day 1 — Create the client record', desc: 'Clients → Add Client. Enter company name, registered address, postcode, country. This becomes the bill-to entity on master invoices.' },
          { label: 'Day 1 — Configure portal permissions', desc: 'Open the client and go to Portal Permissions. Toggle which modules they can see (Dashboard, Payslips, Candidates, Files, Support).' },
          { label: 'Day 2 — Invite the portal user', desc: 'Client Users → Invite. The end-user receives a sign-in link and password reset email. They land on /portal with read-only access.' },
          { label: 'Day 3 — Customise their onboarding form', desc: 'Settings → Onboarding Form. Add or hide fields specific to this client (e.g. site induction questions, PPE confirmation).' },
          { label: 'Day 5 — Pre-load candidates', desc: 'Candidates → Add Candidate, or share the self-service onboarding URL with the client to collect candidate details directly.' },
          { label: 'Day 7 — Test the clock flow', desc: 'Generate clock-in/out URLs for at least one candidate and verify GPS capture and name matching work on a mobile device.' },
          { label: 'Day 14 — First payroll run', desc: 'Run the full Weekly Payroll workflow above. Confirm both the client and the candidates receive their PDFs without issue.' },
        ],
        tip: 'Document any client-specific quirks (preferred invoice email, custom PO references, approval thresholds) in the Support tab so the whole team has visibility.',
      },
      {
        title: 'Onboarding a new candidate',
        content: 'Two routes — admin-led or self-service. Choose based on the client\'s preference.',
        list: [
          { label: 'Route A — Admin-led', desc: 'Candidates → Add Candidate. Enter all 9 sections (personal, contact, bank, NI, RTW, etc.). Upload identity documents to the private bucket. Save.' },
          { label: 'Route A continued — Send credentials', desc: 'Open the candidate, click Create Login. The candidate receives an email to set their password and access /candidate.' },
          { label: 'Route B — Self-service', desc: 'Share the client-specific onboarding URL with the candidate. They complete the form themselves; the record is created in Candidates with all uploaded documents attached.' },
          { label: 'Verify compliance', desc: 'Tick Right to Work, Proof of Address, and Application checkboxes once you have reviewed the documents. These flags appear on candidate lists.' },
          { label: 'Assign hourly rate & client', desc: 'Set the candidate\'s default hourly rate and bill-to client. These pre-populate timesheet rows automatically.' },
        ],
      },
      {
        title: 'Handling a payroll exception',
        content: 'When something goes wrong mid-cycle, follow this triage flow.',
        list: [
          { label: 'Missing clock-out', desc: 'Time Logs → Edit the entry. Manually enter the clock-out time based on the candidate\'s confirmation (record the source in the notes).' },
          { label: 'Disputed hours', desc: 'Reject the timesheet. Open a Support ticket on the client\'s behalf with the candidate\'s explanation. Re-approve only after written agreement.' },
          { label: 'Wrong hourly rate on invoice', desc: 'You cannot edit a generated invoice. Have a Super Admin delete it from Invoice History, correct the rate on the candidate, then regenerate.' },
          { label: 'Bank details rejected by BACS', desc: 'Update the candidate\'s bank details in Candidates. Regenerate only that candidate\'s self-bill from Self-Billed Invoices.' },
          { label: 'Candidate missing from self-bill batch', desc: 'Check the Candidate Master upload — the Employee ID on the timesheet must exactly match the candidate record. Fix the mismatch and re-run.' },
        ],
        tip: 'Every exception should result in either a Support ticket or an Audit Log entry. Never resolve issues by-pass — traceability is required for HMRC and GDPR.',
      },
      {
        title: 'Month-end close',
        content: 'Run on the first working day after each calendar month ends.',
        list: [
          { label: 'Reconcile invoices vs timesheets', desc: 'Filter Invoice History by month. Cross-check the total against the sum of approved hours × rates from Timesheets.' },
          { label: 'Chase unpaid invoices', desc: 'Use Client Billing Records to identify invoices past their due date. Send a polite reminder via Support or email.' },
          { label: 'Archive backups', desc: 'Files are retained automatically for 6 years (HMRC). Confirm no manual deletions occurred in the Audit Log.' },
          { label: 'Review portal activity', desc: 'Dashboard → check active candidate count, total spend, and VAT trends. Flag anomalies for management review.' },
          { label: 'Update Candidate Master', desc: 'Remove leavers, add joiners, refresh any expiring RTW documents.' },
        ],
      },
      {
        title: 'Quarterly compliance review',
        content: 'Required to maintain UK GDPR and HMRC standing.',
        list: [
          { label: 'Audit Log review', desc: 'Open the Audit Log and scan for unusual activity — bulk deletes, off-hours logins, repeated failed auth.' },
          { label: 'RTW expiry sweep', desc: 'Filter candidates by Right to Work expiry. Request renewed documents from anyone within 60 days of expiry.' },
          { label: 'Permissions audit', desc: 'Review all team members in Team and all portal users in Client Users. Remove anyone who has left.' },
          { label: 'Retention check', desc: 'Confirm leavers from 6+ years ago have had their personal data anonymised in line with GDPR retention policy.' },
        ],
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