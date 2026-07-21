import PageLayout from '@/components/layout/PageLayout';
import IndustriesSection from '@/components/IndustriesSection';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, ArrowRight, Calculator, Clock, Shield, CreditCard } from 'lucide-react';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

const services = [
  {
    title: 'Full-Service Payroll Processing',
    overview: "We manage every step of payroll processing, helping that employees are paid accurately and on schedule. This service includes calculation of wages, tax deductions, and statutory payments like National Insurance and pensions.",
    audience: [
      { label: 'For Employers', text: 'Streamlines payroll, reduces administrative burden, and helps accuracy in all salary-related calculations.' },
    ],
    features: [
      'Regular payroll runs (weekly, fortnightly, or monthly). Calculation of regular and overtime wages.',
      'Secure digital payslips for employees.',
    ],
  },
  {
    title: 'Statutory Compliance and Reporting',
    overview: "Staying compliant with HMRC requirements is essential to avoid penalties and legal issues. We handle all compliance tasks, including PAYE (Pay As You Earn) submissions, National Insurance contributions, and reporting for Real-Time Information (RTI).",
    audience: [
      { label: 'For Employers', text: 'Ensures that all payroll practices are up-to-date with current UK legislation and prevents issues with tax authorities.' },
    ],
    features: [
      'Timely RTI submissions to HMRC.',
      'P45 and P60 generation for departing employees.',
      'Accurate National Insurance and pension contributions.',
    ],
  },
  {
    title: 'Auto-Enrolment and Pension Management',
    overview: "Managing workplace pensions under the auto-enrolment legislation is a responsibility for all UK employers. We take care of all aspects of pension management, helping employees are enrolled automatically, contributions are calculated, and records are kept.",
    audience: [
      { label: 'For Employers', text: 'Reduces the burden of pension compliance and helps employees stay informed about their pension status.' },
    ],
    features: [
      'Automatic enrolment of eligible employees.',
      'Regular pension assessments and updates.',
      'Coordination with pension providers and accurate contributions.',
    ],
  },
  {
    title: 'Payroll Tax Advisory and Deductions',
    overview: "With a detailed understanding of UK tax codes, we help that employees' tax is calculated accurately, accounting for personal allowances, student loans, and other deductions.",
    audience: [
      { label: 'For Employers and Employees', text: 'Helps both parties help accurate tax management, reducing the risk of underpayments or overpayments.' },
    ],
    features: [
      'Personalised tax code assessments.',
      'Employee benefits.',
      'Assistance with tax code changes and adjustments',
    ],
  },
  {
    title: 'Employee Benefits Administration',
    overview: "Administering benefits like sick pay, maternity leave, paternity pay, and holiday pay can be complex. Our services help that all employee benefits are calculated and managed in compliance with employment law.",
    audience: [
      { label: 'For Employers', text: 'Provides peace of mind that all employee benefits are managed fairly and accurately.' },
    ],
    features: [
      'Sick pay and statutory leave calculations.',
      'Holiday pay tracking and payments.',
      'Management of other employee benefits and expenses.',
    ],
  },
  {
    title: 'Payroll Software Integration and Support',
    overview: "For businesses with in-house payroll systems, we offer support with payroll software integration, setup, and maintenance. We work with leading UK payroll software providers to optimise payroll efficiency.",
    audience: [
      { label: 'For Employers', text: 'Streamlines payroll processing with cutting-edge software, improves accuracy, and provides employees with easy access to their payroll information.' },
    ],
    features: [
      'Setup and integration of payroll software.',
      'Training and support for in-house payroll teams.',
      'Secure data management with GDPR-compliant practices.',
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
            Efficient, accurate, and compliant payroll services. We handle all necessary deductions including taxes, National Insurance, pension contributions, and applicable levies - helping you are paid correctly and promptly.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-medium text-foreground mb-4">How it works</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                At AMEX Outsourcing, we prioritise efficiency in everything we do, helping that your timesheet submissions and payment processes are as streamlined as possible. Our user-friendly system works whether you're on a weekly or monthly schedule.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Once your timesheets are approved, we handle all invoicing on your behalf, helping your agency or end client receives a clear and accurate breakdown of the services you've provided. Our team manages the entire invoicing process, from generating and submitting invoices to following up on payments.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your net pay, along with a detailed breakdown of all deductions, will be clearly outlined in your payslip. We aim to provide full transparency so that you understand exactly what is being deducted and why.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Calculator, title: 'Payroll Calculations', desc: 'Accurate wage calculations with all tax and NI deductions handled automatically.' },
                { icon: FileText, title: 'Invoice Management', desc: 'Generating, submitting, and following up on invoices on your behalf.' },
                { icon: CreditCard, title: 'Swift Payments', desc: 'Once timesheets are approved, you are paid promptly with full transparency.' },
                { icon: Shield, title: 'Full Compliance', desc: 'All processes comply with UK regulations, maximising your take-home pay.' },
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
              'Full payment transparency',
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
          <p className="text-muted-foreground mb-8">Let us handle the complexity so you can focus on your core business.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
