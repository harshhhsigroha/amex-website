import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText, Users, Headphones, BarChart3,
  CheckCircle2, AlertTriangle, BookOpen, Download, MessageSquare, ListChecks,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sections = [
  {
    icon: BarChart3,
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-200',
    title: 'Dashboard',
    steps: [
      {
        title: 'Your financial overview',
        content: 'The Dashboard shows a summary of all payslips your agency has raised against your company — total spend, gross labour costs, VAT charged, and the number of candidates working for you.',
      },
      {
        title: 'Recent payslips',
        content: 'The bottom of the dashboard shows your most recent payslips at a glance. Click on any payslip to see more details or download the PDF.',
      },
    ],
  },
  {
    icon: FileText,
    color: 'text-violet-600',
    bg: 'bg-violet-500/10',
    border: 'border-violet-200',
    title: 'Payslips',
    steps: [
      {
        title: 'Viewing your payslips',
        content: 'The Payslips tab shows all payslips raised against your company. You can filter by financial year and search by payslip number.',
      },
      {
        title: 'Downloading a PDF',
        content: 'Click the Download button on any payslip to download the original PDF. The file is retrieved directly from secure storage.',
        tip: 'If a download fails, contact your agency — the PDF may not have been uploaded to the system yet.',
      },
      {
        title: 'Payslip details',
        content: 'Each payslip shows: payslip number, date, financial year/week, billing period, number of candidates, gross labour total, VAT, and grand total.',
      },
    ],
  },
  {
    icon: Users,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-200',
    title: 'Candidates',
    steps: [
      {
        title: 'Viewing your candidates',
        content: "The Candidates tab shows a list of all candidates who have appeared on at least one payslip for your company. You can see how many payslips each candidate has been included in.",
      },
      {
        title: 'Candidate privacy',
        content: 'You can see candidate names and Employee IDs. Sensitive personal data such as bank details, NI numbers, and addresses are not visible in this portal — they are controlled by your agency.',
      },
    ],
  },
  {
    icon: Download,
    color: 'text-teal-600',
    bg: 'bg-teal-500/10',
    border: 'border-teal-200',
    title: 'Files',
    steps: [
      {
        title: 'Browsing your files',
        content: 'The Files tab provides access to all documents stored by your agency for your company — including payslips, self-billed remittances, and timesheet reports. Files are organised by financial week.',
      },
      {
        title: 'Downloading files',
        content: 'Click on any file to download it. You can filter by financial year and week to quickly locate documents from a specific period.',
      },
    ],
  },
  {
    icon: Headphones,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-200',
    title: 'Support',
    steps: [
      {
        title: 'Raising a ticket',
        content: "If you have a query about a payslip, a candidate, or anything else, use the Support tab to raise a ticket. Click 'New Ticket', choose a priority, write your subject and description, then submit.",
      },
      {
        title: 'Tracking your ticket',
        content: "All your tickets are listed on the left side. Click a ticket to view the conversation. Your agency's team will respond here.",
      },
      {
        title: 'Ticket statuses',
        content: null,
        list: [
          { label: 'Open', desc: 'Your ticket has been submitted and is awaiting a response' },
          { label: 'In Progress', desc: 'Your agency is actively working on your query' },
          { label: 'Resolved', desc: 'Your query has been resolved' },
          { label: 'Closed', desc: 'The ticket has been closed' },
        ],
      },
    ],
  },
  {
    icon: ListChecks,
    color: 'text-rose-600',
    bg: 'bg-rose-500/10',
    border: 'border-rose-200',
    title: 'Playbook',
    steps: [
      {
        title: 'Weekly check — every Monday',
        content: 'A 5-minute routine to stay on top of your account.',
        list: [
          { label: '1. Open the Dashboard', desc: 'Confirm last week\'s payslip count and total spend look correct against your expectations.' },
          { label: '2. Spot-check a payslip', desc: 'Open Payslips, click into the most recent entry, and verify the candidate count and total match your records.' },
          { label: '3. Download for your records', desc: 'Use the Download button to save a copy of any new payslips locally or to your finance share drive.' },
          { label: '4. Review the candidate list', desc: 'Open Candidates and check no one unexpected has been added. Raise a Support ticket if you spot anyone you don\'t recognise.' },
          { label: '5. Clear your inbox', desc: 'Open Support and reply to any messages from the AMEX team.' },
        ],
        tip: 'Bookmark the portal in your browser and add a calendar reminder for Monday mornings — the routine takes under 5 minutes once you\'re set up.',
      },
      {
        title: 'Reconciling a payslip',
        content: 'When your accounts team needs to verify the figures behind a payslip total.',
        list: [
          { label: 'Open the payslip', desc: 'Payslips → click the row. The detail panel shows gross, VAT, and grand total alongside the period covered.' },
          { label: 'Check candidate count', desc: 'The detail panel lists how many candidates are included. Cross-check against your site sign-in sheets or rota.' },
          { label: 'Match the period', desc: 'Confirm the start/end dates match the financial week shown. UK weeks run Sunday to Saturday and follow the 6 April – 5 April tax year.' },
          { label: 'Download supporting timesheets', desc: 'Open Files, filter by the same financial week, and download the candidate timesheet PDFs that back up the payslip.' },
          { label: 'Query if needed', desc: 'If the totals don\'t reconcile, raise a Support ticket and quote the payslip number — AMEX will respond within their SLA.' },
        ],
      },
      {
        title: 'Disputing a charge',
        content: 'Formal process for raising a query you want investigated and resolved.',
        list: [
          { label: 'Gather evidence first', desc: 'Note the payslip number, the specific candidate(s) or line(s) in dispute, and the expected vs actual figure.' },
          { label: 'Open a Support ticket', desc: 'Support → New Ticket. Set priority: High for amounts over £1,000, Medium otherwise. Use a clear subject like "Payslip INV-2026-014 — disputed hours for J. Smith".' },
          { label: 'Attach context', desc: 'Paste the evidence into the description. AMEX will reply in the same ticket so the full conversation is preserved.' },
          { label: 'Track status', desc: 'Status moves Open → In Progress → Resolved. You\'ll see updates in the ticket — you don\'t need to chase by email.' },
          { label: 'Close the loop', desc: 'Once resolved, AMEX may issue a credit note or revised payslip. This appears as a new entry in Payslips.' },
        ],
        tip: 'Disputes raised within 14 days of a payslip date are easier to resolve. Anything older may require an audit — flag it as soon as you spot it.',
      },
      {
        title: 'Onboarding a new starter',
        content: 'Your role when a new candidate joins your site.',
        list: [
          { label: 'Notify AMEX', desc: 'Raise a Support ticket with the new starter\'s full name, start date, role, and expected hours per week.' },
          { label: 'AMEX provisions the candidate', desc: 'AMEX adds them to the system, runs Right to Work checks, and configures their hourly rate. They will appear in your Candidates tab once active.' },
          { label: 'Site induction', desc: 'Run your normal site induction. The candidate uses their personal clock-in URL on day one — AMEX provides this directly to them.' },
          { label: 'First-week check', desc: 'After their first week, open Candidates and confirm the new starter appears with the correct payslip count (1 payslip after their first complete week).' },
        ],
      },
      {
        title: 'Year-end checklist',
        content: 'Run in early April for the closing UK financial year.',
        list: [
          { label: 'Download all payslips', desc: 'Filter Payslips by the closing financial year. Download every PDF to your year-end records folder.' },
          { label: 'Export the files archive', desc: 'Files → filter by year. Download timesheet PDFs for your records — AMEX retains these for 6 years but a local copy is recommended.' },
          { label: 'Reconcile annual spend', desc: 'Sum the grand totals across all payslips for the year and confirm against your accounts payable ledger.' },
          { label: 'Review active candidates', desc: 'Confirm everyone in your Candidates tab is still working with you. Notify AMEX of any leavers via Support.' },
        ],
      },
    ],
  },
];

export function PortalGuide() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Portal Guide</h2>
        </div>
        <p className="text-sm text-muted-foreground">How to use your company's payslip portal</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            {/* Section header */}
            <div className={cn('flex items-center gap-3 p-4 rounded-xl border', section.border, section.bg)}>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/80 shadow-sm">
                <section.icon className={cn('h-5 w-5', section.color)} />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{section.title}</h3>
                <p className="text-xs text-muted-foreground">{section.steps.length} topic{section.steps.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {section.steps.map((step, i) => (
              <Card key={i} className="border-border/50">
                <CardHeader className="pb-2 pt-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className={cn('h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0', section.bg)}>
                      <span className={section.color}>{i + 1}</span>
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
                          <CheckCircle2 className={cn('h-4 w-4 shrink-0 mt-0.5', section.color)} />
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
        ))}
      </div>
    </div>
  );
}
