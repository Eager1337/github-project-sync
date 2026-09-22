import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, Star, Heart } from 'lucide-react';

const Product3DMockup = () => {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      {/* Glow Effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-80 h-80 rounded-full bg-gold/20 blur-3xl"
        />
      </div>

      {/* Main Product Card - 3D Effect */}
      <motion.div
        animate={{
          rotateY: [0, 5, -5, 0],
          rotateX: [0, -3, 3, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ perspective: 1000 }}
        className="relative z-10"
      >
        <div className="w-72 h-96 rounded-3xl bg-gradient-to-br from-card via-card to-muted border border-gold/30 shadow-2xl overflow-hidden transform-gpu"
             style={{ transformStyle: 'preserve-3d' }}>
          {/* Product Image */}
          <div className="relative h-64 overflow-hidden">
            <motion.img
              src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80"
              alt="Luxury Dress"
              className="w-full h-full object-cover"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            
            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-4 left-4 px-3 py-1 bg-gold text-teal-darker text-xs font-bold rounded-full flex items-center gap-1"
            >
              <Star className="w-3 h-3" />
              Best Seller
            </motion.div>

            {/* Heart Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur flex items-center justify-center text-gold"
            >
              <Heart className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-2">
            <p className="text-gold text-xs uppercase tracking-wider">Wedding Collection</p>
            <h3 className="font-serif font-bold text-lg text-foreground">Elegant Silk Gown</h3>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gold">Le 850,000</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-gold text-teal-darker flex items-center justify-center"
              >
                <ShoppingBag className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        className="absolute -top-10 right-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-gold"
      >
        <Sparkles className="w-8 h-8 text-teal-darker" />
      </motion.div>

      <motion.div
        animate={{
          y: [0, 15, 0],
          x: [0, -10, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        className="absolute bottom-20 -left-5 w-20 h-20 rounded-2xl bg-card border border-gold/30 flex items-center justify-center shadow-xl"
      >
        <div className="text-center">
          <span className="text-2xl font-bold text-gold">50+</span>
          <p className="text-[10px] text-muted-foreground">New Items</p>
        </div>
      </motion.div>

      <motion.div
        animate={{
          y: [0, -15, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
        className="absolute top-20 -left-10 w-14 h-14 rounded-full bg-destructive/80 flex items-center justify-center text-white font-bold text-sm shadow-lg"
      >
        -30%
      </motion.div>

      {/* Small Floating Orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30 + i * 5, 0],
            x: [0, 10 - i * 3, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
          className="absolute w-3 h-3 rounded-full bg-gold/60"
          style={{
            top: `${20 + i * 15}%`,
            left: `${80 + (i % 2) * 15}%`,
          }}
        />
      ))}
    </div>
  );
};

export default Product3DMockup;
