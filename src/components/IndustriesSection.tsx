import { motion } from 'framer-motion';
import { Utensils, Hammer, HeartPulse, Truck } from 'lucide-react';
import constructionImg from '@/assets/industry-construction.jpg';
import healthcareImg from '@/assets/industry-healthcare.jpg';
import hospitalityImg from '@/assets/industry-hospitality.jpg';
import logisticsImg from '@/assets/industry-logistics.jpg';

const industries = [
  { icon: Hammer, title: 'Construction', img: constructionImg, href: '/industries/construction' },
  { icon: HeartPulse, title: 'Healthcare', img: healthcareImg, href: '/industries/healthcare' },
  { icon: Utensils, title: 'Hospitality', img: hospitalityImg, href: '/industries/hospitality' },
  { icon: Truck, title: 'Logistics', img: logisticsImg, href: '/industries/logistics' },
];

export default function IndustriesSection() {
  return (
    <section className="py-20 px-6 bg-background border-t border-border/20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-medium text-foreground text-center mb-4">Sectors we work with</h2>
        <p className="text-sm text-muted-foreground text-center mb-10 max-w-lg mx-auto">
          We support organisations across various sectors, shaping our services around the needs of each industry.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {industries.map((ind, i) => (
            <motion.a key={ind.title} href={ind.href}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
              className="glass-premium rounded-xl overflow-hidden group transition-all duration-300 block">
              <div className="h-36 overflow-hidden">
                <img src={ind.img} alt={ind.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={400} height={144} />
              </div>
              <div className="p-5 text-center">
                <div className="w-10 h-10 rounded-lg glass mx-auto mb-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <ind.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-foreground">{ind.title}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
