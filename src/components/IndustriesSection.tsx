import { motion } from 'framer-motion';
import { Factory, Truck, Utensils, Hammer, HeartPulse, GraduationCap } from 'lucide-react';

const industries = [
  { icon: Hammer, title: 'Construction' },
  { icon: HeartPulse, title: 'Healthcare' },
  { icon: Utensils, title: 'Hospitality' },
  { icon: Factory, title: 'Manufacturing' },
  { icon: Truck, title: 'Logistics & Transport' },
  { icon: GraduationCap, title: 'Education' },
];

export default function IndustriesSection() {
  return (
    <section className="py-20 px-6 bg-background border-t border-border/20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-medium text-foreground text-center mb-4">Industries we support</h2>
        <p className="text-sm text-muted-foreground text-center mb-10 max-w-lg mx-auto">
          We work with organisations across a range of sectors, tailoring our services to meet industry-specific requirements.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {industries.map((ind, i) => (
            <motion.div key={ind.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
              className="glass-premium rounded-xl p-5 text-center group transition-all duration-300">
              <div className="w-10 h-10 rounded-lg glass mx-auto mb-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <ind.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-foreground">{ind.title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
