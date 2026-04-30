import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText, Clock, UserCircle2, Headphones,
  CheckCircle2, AlertTriangle, BookOpen, ListChecks,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sections = [
  {
    icon: FileText,
    color: 'text-violet-600',
    bg: 'bg-violet-500/10',
    border: 'border-violet-200',
    title: 'Self-Bills',
    steps: [
      {
        title: 'What you see here',
        content: 'The Self-Bills tab shows every remittance AMEX has produced for you — one per pay period. Each line shows the period covered, hours worked, hourly rate, gross pay, deductions, and net total.',
      },
      {
        title: 'Downloading a PDF',
        content: 'Click any self-bill to open the detail view, then use the Download button to save the PDF for your records, accountant, or HMRC self-assessment.',
        tip: 'Self-bills are sorted by UK financial year and week, with the most recent first.',
      },
      {
        title: 'Querying a payment',
        content: 'If a self-bill looks wrong — incorrect hours, missing days, wrong rate — raise a Support ticket immediately and quote the remittance number.',
      },
    ],
  },
  {
    icon: Clock,
    color: 'text-cyan-600',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-200',
    title: 'Time Logs',
    steps: [
      {
        title: 'How clock-in/out works',
        content: 'You receive a personal clock-in URL when you start. Open it on your phone at the start and end of each shift. Your GPS location and the time are captured automatically.',
        tip: 'Bookmark the URL on your phone home screen for one-tap access.',
      },
      {
        title: 'Reviewing your hours',
        content: 'The Time Logs tab shows every clock-in and clock-out you have submitted. Check this against your own records to confirm everything is captured correctly.',
      },
      {
        title: 'Missing a clock?',
        content: 'If you forgot to clock in or out, raise a Support ticket the same day with the date, the site, and the actual time. AMEX will correct the record.',
      },
    ],
  },
  {
    icon: UserCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-200',
    title: 'Profile',
    steps: [
      {
        title: 'Your details',
        content: 'The Profile tab shows your registered information — name, contact details, NI number, bank details. Keep these accurate to avoid pay delays.',
      },
      {
        title: 'Updating bank details',
        content: 'Bank details flow into your next self-bill. If you change account, update them at least 3 days before the next payroll run.',
        tip: 'After updating, double-check the sort code and account number — typos cause BACS rejections and delay payment.',
      },
      {
        title: 'Right to Work',
        content: 'Your RTW status is visible here. If your visa or share code is approaching expiry, AMEX will contact you — please respond promptly with renewed documents.',
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
        content: 'Click New Ticket. Choose a priority, write a clear subject (e.g. "Missing clock-out 03/05/2026"), describe the issue in the message, and submit.',
      },
      {
        title: 'Chatting with AMEX',
        content: 'Open any ticket to see the full conversation. AMEX replies appear inline — you don\'t need to refresh.',
      },
      {
        title: 'Ticket statuses',
        content: null,
        list: [
          { label: 'Open', desc: 'Submitted and waiting for first response' },
          { label: 'In Progress', desc: 'AMEX is working on your query' },
          { label: 'Resolved', desc: 'Your query has been resolved — reply if you need to reopen' },
          { label: 'Closed', desc: 'No further action — ticket archived' },
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
        title: 'Your daily routine',
        content: 'Two clicks a day keeps your pay on track.',
        list: [
          { label: 'Start of shift', desc: 'Open your clock-in URL the moment you arrive on site. Wait for the GPS confirmation before walking away.' },
          { label: 'During the day', desc: 'No action needed — your time is being tracked.' },
          { label: 'End of shift', desc: 'Open the same URL again to clock out before you leave site. Confirm the elapsed time looks correct.' },
          { label: 'Weekend', desc: 'On Sunday, open Time Logs and review the week. Raise Support tickets for any missing entries before payroll runs on Monday.' },
        ],
        tip: 'If your phone runs out of battery, ask a colleague to log a Support ticket on your behalf at the end of shift — never wait until next week.',
      },
      {
        title: 'Weekly pay routine',
        content: 'Your self-bill arrives within a few working days of the week ending.',
        list: [
          { label: 'Monday — payroll runs', desc: 'AMEX processes the prior week\'s timesheets and generates self-bills.' },
          { label: 'Tuesday/Wednesday — review', desc: 'Open Self-Bills in your portal. Verify hours, rate, and totals against your own log.' },
          { label: 'Wednesday/Thursday — payment', desc: 'Funds typically arrive in the bank account on file. Check your statement.' },
          { label: 'If anything is wrong', desc: 'Raise a Support ticket the same day. The faster you raise it, the faster it\'s resolved.' },
        ],
      },
      {
        title: 'Updating your details',
        content: 'When something changes in your personal life, do this immediately.',
        list: [
          { label: 'New phone number or email', desc: 'Profile → update. AMEX uses these for urgent contact.' },
          { label: 'New address', desc: 'Profile → update. Some clients also require a new Proof of Address — AMEX will let you know.' },
          { label: 'New bank account', desc: 'Profile → update bank details. Then raise a Support ticket confirming the change so AMEX can verify before the next BACS run.' },
          { label: 'New Right to Work documents', desc: 'Raise a Support ticket and attach the new share code or visa. Do not let RTW lapse — AMEX must legally pause work otherwise.' },
        ],
        tip: 'Bank changes take effect from the next payroll run, not retrospectively. Past self-bills will still show your old details.',
      },
      {
        title: 'Year-end (April)',
        content: 'Before the UK financial year ends on 5 April:',
        list: [
          { label: 'Download every self-bill', desc: 'Filter Self-Bills by the closing financial year and save each PDF locally — you\'ll need them for self-assessment.' },
          { label: 'Confirm bank totals', desc: 'Add up the net totals and reconcile against your bank statements.' },
          { label: 'Check your details', desc: 'Visit Profile and confirm your name, address, NI number, and bank details are current — these flow into the new tax year.' },
          { label: 'Speak to your accountant', desc: 'Self-bills are accepted by HMRC as evidence of self-employed earnings. Share PDFs directly.' },
        ],
      },
      {
        title: 'When something feels off',
        content: 'If anything looks wrong, follow this escalation path.',
        list: [
          { label: 'First — check yourself', desc: 'Open Time Logs and Self-Bills. Compare against your personal records. Many issues are typos or memory mismatches.' },
          { label: 'Second — raise a ticket', desc: 'Use Support with priority Medium and a clear subject. Include dates, times, and amounts.' },
          { label: 'Third — wait for SLA', desc: 'AMEX responds within their stated SLA. You\'ll see status updates in the ticket.' },
          { label: 'Fourth — escalate', desc: 'If the ticket is unresolved past SLA, reply to the ticket asking for escalation. A senior team member will pick it up.' },
        ],
      },
    ],
  },
];

export function CandidateGuide() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Candidate Guide</h2>
        </div>
        <p className="text-sm text-muted-foreground">How to use your AMEX Outsourcing candidate portal</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
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
                  {'list' in step && step.list && (
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
