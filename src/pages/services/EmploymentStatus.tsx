import PageLayout from '@/components/layout/PageLayout';
import IndustriesSection from '@/components/IndustriesSection';
import { motion } from 'framer-motion';
import { Scale, CheckCircle2, ArrowRight, ShieldCheck, FileText, Users } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

const services = [
  {
    id: 'assessment',
    title: 'Employment Status Assessment',
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">Service Overview:</strong> Our Employment Status Assessment examines the nature of your job, tasks, level of control, and relationship with the organisation. We compare these factors against industry standards and legal criteria to determine the accurate employment classification.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">For Employers:</strong> Ensures all workers are classified accurately to avoid penalties and optimise workforce structure. This service also includes audits for employers looking to confirm their current classifications.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">For Workers:</strong> Clarifies your status to help you claim the rights and benefits you're entitled to and safeguard against any potential misclassification.
        </p>
        <p className="text-sm font-medium text-foreground mb-2">Key Benefits:</p>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Avoidance of legal disputes and penalties.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Clear communication of roles and responsibilities.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Assurance of compliance with employment regulations.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'rights',
    title: 'Employment Rights Consultation',
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">Service Overview:</strong> We provide consultations tailored to your employment status, helping you understand your specific rights and protections. This includes pay entitlements, working hour limitations, leave policies, and more.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">For Employees and Workers:</strong> Discover your rights to minimum wage, paid leave, sick pay, and other benefits specific to employees or workers.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">For Contractors and Freelancers:</strong> Learn about your rights to contract terms, negotiation options, and protections for timely payment and fair working conditions.
        </p>
        <p className="text-sm font-medium text-foreground mb-2">Key Benefits:</p>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Confidence in understanding your rights and obligations.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Assurance that you are not missing out on benefits or protections.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Enhanced ability to advocate for fair treatment within your role.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'dispute',
    title: 'Dispute Resolution Support',
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">Service Overview:</strong> Our Dispute Resolution Support guides both individuals and employers in addressing conflicts related to employment status or rights. We provide mediation, negotiation, and documentation to help resolve conflicts efficiently and respectfully.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">For Employers:</strong> Resolve disputes effectively, maintaining workplace morale and avoiding potential legal action.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">For Workers:</strong> Protect your rights and receive assistance in handling disagreements over classification, benefits eligibility, and contract disputes.
        </p>
        <p className="text-sm font-medium text-foreground mb-2">Key Benefits:</p>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Reduced risk of costly legal proceedings.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Professional support in achieving mutually agreeable solutions.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Preservation of working relationships through fair and clear communication.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'documentation',
    title: 'Employment Status Documentation and Compliance',
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">Service Overview:</strong> We provide tailored documentation support, helping you develop contracts, job descriptions, and other essential documents that accurately reflect employment status. This includes templates for employment contracts, contractor agreements, and verification letters.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">For Employers:</strong> Gain confidence that all employment paperwork is legally compliant and reflective of each worker's classification.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">For Workers:</strong> Obtain proof of employment status and receive assistance in preparing documentation to formalise your role and clarify your position.
        </p>
        <p className="text-sm font-medium text-foreground mb-2">Key Benefits:</p>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Clear communication of employment terms.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Legal protection for both parties.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Confidence in compliance with relevant employment laws.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'transition',
    title: 'Transition Assistance and Status Changes',
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">Service Overview:</strong> Navigating transitions between different employment statuses-such as moving from employee to contractor, or from full-time to part-time-can be complex. Our Transition Assistance service provides the guidance and documentation support needed to manage these changes smoothly.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">For Individuals:</strong> We help you understand new tax obligations, rights, and potential impacts on benefits during employment changes.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">For Employers:</strong> Receive support in revising contracts, updating employee handbooks, and restructuring workforce plans.
        </p>
        <p className="text-sm font-medium text-foreground mb-2">Key Benefits:</p>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Smooth transition with clear understanding of new roles and obligations.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Reduced risk of misclassification and related penalties.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Legal clarity for both parties throughout the change process.</li>
        </ul>
      </>
    ),
  },
];

export default function EmploymentStatus() {
  return (
    <PageLayout>
      <section className="py-20 px-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.p {...fade} className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] mb-4">Our Services</motion.p>
          <motion.h1 {...fade} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(2.5rem,5vw,4rem)] font-medium text-foreground leading-tight tracking-tight mb-6">
            Employment Status
          </motion.h1>
          <motion.p {...fade} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            At AMEX Outsourcing, we help you manage your employment status seamlessly. Whether you're a self-employed contractor, agency worker, or PAYE employee, understanding your employment status is crucial for determining your tax obligations, legal rights, and the benefits you are entitled to.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-medium text-foreground mb-4">What is Employment Status?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Employment status determines how you are classified for tax purposes - whether as an employee, worker, or self-employed. This classification affects your tax obligations, National Insurance contributions, employment rights, and benefit entitlements.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Recently, there has been a noticeable increase in individuals seeking greater autonomy and adaptability in their professional endeavours. This shift has led to a significant rise in the UK's self-employed population, now totalling 4.3 million.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our expert team ensures you are correctly classified and compliant with UK laws, so you can focus on your work with peace of mind. We provide support for contractors, freelancers, and temporary workers.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Scale, title: 'IR35 Assessments', desc: 'Precise assessments to confirm correct classification status aligned with industry-specific requirements.' },
                { icon: ShieldCheck, title: 'HMRC Compliance', desc: 'Prevent future issues with reclassification, back taxes, or legal challenges.' },
                { icon: FileText, title: 'Documentation', desc: 'Full documentation trail for audit readiness and regulatory compliance.' },
                { icon: Users, title: 'Contractor Support', desc: 'Guidance for contractors, freelancers, and temporary workers on their status.' },
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

      {/* Services Accordion */}
      <section className="py-20 px-6 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fade} className="text-2xl font-medium text-foreground text-center mb-10">Our Employment Status Services</motion.h2>
          <Accordion type="single" collapsible className="space-y-3">
            {services.map((service, i) => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}>
                <AccordionItem value={service.id} className="glass-premium rounded-xl border-none px-6">
                  <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-5">
                    {service.title}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    {service.content}
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
              'Self-employed classification accuracy assessments',
              'Quarterly compliance audits',
              'IR35 status determinations',
              'Worker classification analysis',
              'Tax obligation guidance',
              'Legal rights clarification',
              'HMRC-ready documentation',
              'Ongoing advisory support',
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
          <h2 className="text-2xl font-medium text-foreground mb-4">Need employment status guidance?</h2>
          <p className="text-muted-foreground mb-8">Our experts are ready to help you navigate the complexities of employment classification.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
