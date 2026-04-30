import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText, Users, Headphones, BarChart3,
  CheckCircle2, AlertTriangle, BookOpen, Download, MessageSquare,
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
