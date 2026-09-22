import { motion } from 'framer-motion';
import { Diamond, Heart, ShieldCheck, Truck, Award, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const stats = [
  { number: '5+', label: 'Years' },
  { number: '10K+', label: 'Customers' },
  { number: '500+', label: 'Products' },
  { number: '24/7', label: 'Support' },
];

const values = [
  { icon: Diamond, title: 'Quality First', description: 'Only the finest products meet our standards.' },
  { icon: Heart, title: 'Customer Love', description: 'Your satisfaction is our priority.' },
  { icon: ShieldCheck, title: 'Authenticity', description: 'Every product is verified authentic.' },
  { icon: Truck, title: 'Fast Delivery', description: 'Nationwide delivery with tracking.' },
];

const OurStory = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 md:pt-40 pb-12 md:pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-6 mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-serif font-bold text-foreground mb-4 md:mb-6">
              Our <span className="text-gold-gradient">Story</span>
            </h1>
            <p className="text-sm md:text-xl text-muted-foreground leading-relaxed">
              Haamkay Enterprises was founded with a simple mission: to bring premium, 
              authentic products to Sierra Leone.
            </p>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="bg-gradient-card py-10 md:py-16 mb-12 md:mb-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-4 gap-4 md:gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-gold mb-1 md:mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground text-xs md:text-base">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Journey */}
        <section className="container mx-auto px-4 md:px-6 mb-12 md:mb-20">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <h2 className="text-xl md:text-3xl font-serif font-bold text-foreground mb-4 md:mb-6">
                From Humble Beginnings to <span className="text-gold">Excellence</span>
              </h2>
              <div className="space-y-3 md:space-y-4 text-muted-foreground text-sm md:text-base">
                <p>
                  Founded in Freetown, Haamkay Enterprises emerged from a passion for 
                  bringing quality products to our community.
                </p>
                <p>
                  Today, we operate from our flagship store at 53 Malamah Thomas Street, 
                  serving thousands of satisfied customers across Sierra Leone.
                </p>
                <p>
                  We believe everyone deserves access to genuine, high-quality products 
                  at fair prices.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-1 lg:order-2"
            >
              <div className="aspect-[4/3] md:aspect-square rounded-xl md:rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"
                  alt="Our Store"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-2 md:-bottom-6 md:-right-6 w-20 h-20 md:w-32 md:h-32 bg-gold rounded-xl md:rounded-2xl flex items-center justify-center">
                <Award className="w-8 h-8 md:w-12 md:h-12 text-teal-darker" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Our Values */}
        <section className="container mx-auto px-4 md:px-6 mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-xl md:text-3xl font-serif font-bold text-foreground mb-2 md:mb-4">
              Our <span className="text-gold">Values</span>
            </h2>
            <p className="text-muted-foreground text-xs md:text-base max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-luxury text-center p-4 md:p-6"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <value.icon className="w-6 h-6 md:w-8 md:h-8 text-gold" />
                </div>
                <h3 className="text-sm md:text-xl font-serif font-semibold text-foreground mb-1 md:mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team CTA */}
        <section className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-luxury text-center py-10 md:py-16 px-4"
          >
            <Users className="w-12 h-12 md:w-16 md:h-16 text-gold mx-auto mb-4 md:mb-6" />
            <h2 className="text-xl md:text-3xl font-serif font-bold text-foreground mb-2 md:mb-4">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground text-xs md:text-base max-w-2xl mx-auto mb-6 md:mb-8">
              Our dedicated team works tirelessly to bring you the best shopping experience.
            </p>
            <Link to="/contact" className="btn-gold inline-block text-sm md:text-base py-3 md:py-4">
              Get in Touch
            </Link>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OurStory;
