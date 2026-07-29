import PageLayout from '@/components/layout/PageLayout';
import IndustriesSection from '@/components/IndustriesSection';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, ArrowRight, Calculator, Clock, Shield, CreditCard } from 'lucide-react';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

const services = [
  {
    title: 'Full-Service Payroll Processing',
    overview: "We look after every step of payroll processing, supporting accurate and on-time employee pay. This service covers calculation of wages, tax deductions, and statutory payments such as National Insurance and pensions.",
    audience: [
      { label: 'For Employers', text: 'Simplifies payroll, eases the administrative load, and supports accuracy across all salary-related calculations.' },
    ],
    features: [
      'Regular payroll runs (weekly, fortnightly, or monthly), with calculation of standard and overtime wages.',
      'Secure digital payslips for employees.',
    ],
  },
  {
    title: 'Statutory Compliance and Reporting',
    overview: "Keeping up with HMRC requirements matters for avoiding penalties and legal issues. We handle compliance tasks including PAYE (Pay As You Earn) submissions, National Insurance contributions, and Real-Time Information (RTI) reporting.",
    audience: [
      { label: 'For Employers', text: 'Helps keep payroll practices in step with current UK legislation and reduces the risk of issues with tax authorities.' },
    ],
    features: [
      'Timely RTI submissions to HMRC.',
      'P45 and P60 generation for departing employees.',
      'Accurate National Insurance and pension contributions.',
    ],
  },
  {
    title: 'Auto-Enrolment and Pension Management',
    overview: "Managing workplace pensions under auto-enrolment legislation is a duty for UK employers. We handle every aspect of pension management, supporting automatic enrolment of employees, accurate contribution calculations, and proper record-keeping.",
    audience: [
      { label: 'For Employers', text: 'Eases the burden of pension compliance and helps keep employees informed about their pension status.' },
    ],
    features: [
      'Automatic enrolment of eligible employees.',
      'Regular pension assessments and updates.',
      'Coordination with pension providers and accurate contributions.',
    ],
  },
  {
    title: 'Payroll Tax Advisory and Deductions',
    overview: "With detailed knowledge of UK tax codes, we support accurate tax calculations for employees, accounting for personal allowances, student loans, and other deductions.",
    audience: [
      { label: 'For Employers and Employees', text: 'Supports both sides in managing tax accurately, reducing the risk of underpayments or overpayments.' },
    ],
    features: [
      'Personalised tax code assessments.',
      'Employee benefits.',
      'Assistance with tax code changes and adjustments',
    ],
  },
  {
    title: 'Employee Benefits Administration',
    overview: "Administering benefits such as sick pay, maternity leave, paternity pay, and holiday pay can be involved. Our services help calculate and manage employee benefits in line with employment law.",
    audience: [
      { label: 'For Employers', text: 'Offers reassurance that employee benefits are managed fairly and accurately.' },
    ],
    features: [
      'Sick pay and statutory leave calculations.',
      'Holiday pay tracking and payments.',
      'Management of other employee benefits and expenses.',
    ],
  },
  {
    title: 'Payroll Software Integration and Support',
    overview: "For businesses running in-house payroll systems, we support payroll software integration, setup, and maintenance. We work with leading UK payroll software providers to help improve payroll efficiency.",
    audience: [
      { label: 'For Employers', text: 'Simplifies payroll processing with up-to-date software, improves accuracy, and gives employees easy access to their payroll information.' },
    ],
    features: [
      'Setup and integration of payroll software.',
      'Training and support for in-house payroll teams.',
      'Secure data management following GDPR-aligned practices.',
    ],
  },
];

export default function PayrollServices() {
  return (
    <PageLayout>
      <section className="py-20 px-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.p {...fade} className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">Our Services</motion.p>
          <motion.h1 {...fade} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(2.5rem,5vw,4rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
            Payroll Services
          </motion.h1>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            Efficient, accurate payroll services designed to help you stay compliant. We take care of the necessary deductions, including tax, National Insurance, pension contributions, and applicable levies, supporting correct and timely pay.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-medium text-foreground mb-4">How it works</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                At AMEX Outsourcing, we focus on efficiency throughout, helping keep your timesheet submissions and payment processes as smooth as possible. Our easy-to-use system works whether you're paid weekly or monthly.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Once your timesheets are approved, we handle invoicing on your behalf, so your agency or end client gets a clear, accurate breakdown of the services you've provided. Our team manages the whole invoicing process, from creating and submitting invoices to chasing payments.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your net pay, together with a detailed breakdown of all deductions, will be set out clearly in your payslip. We aim to keep things transparent so you understand exactly what is being deducted and why.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Calculator, title: 'Payroll Calculations', desc: 'Accurate wage calculations with tax and NI deductions handled automatically.' },
                { icon: FileText, title: 'Invoice Management', desc: 'Creating, submitting, and following up on invoices on your behalf.' },
                { icon: CreditCard, title: 'Swift Payments', desc: 'Once timesheets are approved, you are paid promptly with clear visibility throughout.' },
                { icon: Shield, title: 'Full Compliance', desc: 'Processes aligned with UK regulations, helping you make the most of your take-home pay.' },
              ].map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  className="glass-premium rounded-xl p-5 flex items-start gap-4 group transition-all duration-500">
                  <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <item.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Payroll Services - Accordion */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-medium text-foreground text-center mb-10">Our Payroll Services</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {services.map((svc, i) => (
              <motion.div key={svc.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}>
                <AccordionItem value={`svc-${i}`} className="glass-premium rounded-xl border-none px-5">
                  <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                    {svc.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                      <div>
                        <p className="font-medium text-foreground mb-1">Service Overview:</p>
                        <p>{svc.overview}</p>
                      </div>
                      {svc.audience.map((a) => (
                        <div key={a.label}>
                          <p className="font-medium text-foreground mb-1">{a.label}:</p>
                          <p>{a.text}</p>
                        </div>
                      ))}
                      <div>
                        <p className="font-medium text-foreground mb-2">Key Features:</p>
                        <ul className="space-y-1.5">
                          {svc.features.map((f) => (
                            <li key={f} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-medium text-foreground text-center mb-10">What's included</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Wage and salary calculations',
              'Tax & National Insurance deductions',
              'Pension contributions',
              'Payslip generation',
              'HMRC submissions',
              'Invoice generation & follow-up',
              'Self-billed invoice processing',
              'Clear, transparent payments',
            ].map((item, i) => (
              <motion.div key={item} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <IndustriesSection />

      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-medium text-foreground mb-4">Need payroll support?</h2>
          <p className="text-muted-foreground mb-8">Let us take care of the detail so you can focus on running your business.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
