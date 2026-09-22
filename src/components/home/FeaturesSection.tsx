import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Clock } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Nationwide Delivery',
    description: 'Fast shipping across Sierra Leone',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Guarantee',
    description: 'Authentic, premium products only',
  },
  {
    icon: Clock,
    title: 'Daily New Arrivals',
    description: 'Fresh styles dropped every morning',
  },
];

const FeaturesSection = () => {
  return (
    <section className="bg-card py-6 -mt-8 relative z-20 mx-6 rounded-2xl shadow-card">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
