import { motion } from 'framer-motion';

export default function FloatingDiamonds() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating Diamond Shapes */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ 
            x: `${5 + (i * 6)}%`,
            y: `${15 + (i % 5) * 18}%`,
            rotate: 45,
            opacity: 0 
          }}
          animate={{ 
            y: [`${15 + (i % 5) * 18}%`, `${5 + (i % 5) * 18}%`, `${15 + (i % 5) * 18}%`],
            rotate: [45, 55, 45],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.15, 1]
          }}
          transition={{ 
            duration: 5 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15
          }}
          style={{ left: `${3 + i * 6}%` }}
        >
          <div 
            className="w-6 h-6 md:w-10 md:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-gold via-gold-light to-gold"
            style={{ 
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              boxShadow: '0 0 40px hsl(45 90% 55% / 0.5)',
              filter: 'blur(0.5px)'
            }}
          />
        </motion.div>
      ))}

      {/* Floating Rings - Enhanced */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute border-2 border-gold/25 rounded-full"
          initial={{ 
            opacity: 0,
            scale: 0.6
          }}
          animate={{ 
            opacity: [0.15, 0.4, 0.15],
            scale: [0.6, 1.1, 0.6],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 12 + i * 2,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ 
            width: `${80 + i * 40}px`,
            height: `${80 + i * 40}px`,
            left: `${10 + i * 12}%`,
            top: `${15 + (i % 4) * 22}%`,
            boxShadow: 'inset 0 0 20px hsl(45 90% 55% / 0.1)'
          }}
        />
      ))}

      {/* Sparkles - Enhanced */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute rounded-full"
          style={{
            width: `${2 + Math.random() * 5}px`,
            height: `${2 + Math.random() * 5}px`,
            background: 'linear-gradient(135deg, hsl(45 90% 65%), hsl(45 90% 50%))',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: '0 0 15px hsl(45 90% 55% / 0.9)'
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.3, 1.8, 0.3]
          }}
          transition={{ 
            duration: 2 + Math.random() * 2.5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Star Shapes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 30}%`,
          }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{ 
            opacity: [0, 0.7, 0.3, 0.7, 0],
            scale: [0, 1, 0.9, 1, 0],
            rotate: [0, 72, 144, 216, 288],
          }}
          transition={{ 
            duration: 6 + i,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="rgba(212,175,55,0.7)"
              stroke="rgba(255,215,0,0.5)"
              strokeWidth="1"
            />
          </svg>
        </motion.div>
      ))}

      {/* Hexagon Shapes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`hex-${i}`}
          className="absolute"
          style={{
            left: `${15 + i * 15}%`,
            top: `${30 + (i % 2) * 40}%`,
            width: '30px',
            height: '26px',
          }}
          initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{ 
            opacity: [0, 0.5, 0.3, 0.5, 0],
            scale: [0.5, 1, 1.1, 1, 0.5],
            rotate: [0, 60, 120, 180, 240],
            y: [0, -40, -80],
          }}
          transition={{ 
            duration: 10 + i * 2,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut"
          }}
        >
          <div 
            className="w-full h-full bg-gradient-to-br from-gold/50 to-transparent border border-gold/30"
            style={{ 
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
            }}
          />
        </motion.div>
      ))}

      {/* Gradient Orbs - Enhanced */}
      <motion.div
        className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(45 90% 55% / 0.25) 0%, hsl(45 90% 55% / 0.1) 40%, transparent 70%)',
          left: '55%',
          top: '15%',
          filter: 'blur(20px)'
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.35, 0.15],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute w-80 h-80 md:w-[500px] md:h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(160 45% 30% / 0.3) 0%, hsl(160 45% 20% / 0.1) 40%, transparent 70%)',
          left: '5%',
          bottom: '5%',
          filter: 'blur(30px)'
        }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.08, 0.25, 0.08],
          x: [0, -20, 0],
          y: [0, 15, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Third orb for more depth */}
      <motion.div
        className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(45 90% 60% / 0.2) 0%, transparent 60%)',
          right: '10%',
          top: '50%',
          filter: 'blur(25px)'
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.3, 0.1],
          x: [0, 25, 0],
          y: [0, -25, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating Lines */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
          style={{
            width: `${80 + i * 40}px`,
            left: `${8 + i * 12}%`,
            top: `${20 + i * 10}%`,
            transform: `rotate(${-20 + i * 6}deg)`
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scaleX: [0.8, 1.3, 0.8]
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4
          }}
        />
      ))}

      {/* 3D Cube Effect */}
      <motion.div
        className="absolute"
        style={{
          left: '70%',
          top: '60%',
          perspective: '1000px'
        }}
        animate={{
          rotateY: [0, 360],
          rotateX: [0, 20, 0, -20, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div 
          className="w-12 h-12 md:w-16 md:h-16 border border-gold/25 bg-gradient-to-br from-gold/10 to-transparent"
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: '0 0 30px hsl(45 90% 55% / 0.2)'
          }}
        />
      </motion.div>

      {/* Second 3D Cube */}
      <motion.div
        className="absolute"
        style={{
          left: '20%',
          top: '70%',
          perspective: '1000px'
        }}
        animate={{
          rotateY: [360, 0],
          rotateX: [0, -15, 0, 15, 0]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div 
          className="w-10 h-10 md:w-14 md:h-14 border border-gold/20 bg-gradient-to-tl from-gold/10 to-transparent"
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: '0 0 25px hsl(45 90% 55% / 0.15)'
          }}
        />
      </motion.div>

      {/* Pulse Circles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`pulse-${i}`}
          className="absolute rounded-full border border-gold/20"
          style={{
            width: '80px',
            height: '80px',
            left: `${15 + i * 18}%`,
            top: `${65 - i * 12}%`
          }}
          animate={{
            scale: [1, 2.5, 1],
            opacity: [0.4, 0, 0.4]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Triangle shapes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`tri-${i}`}
          className="absolute"
          style={{
            left: `${25 + i * 12}%`,
            top: `${10 + (i % 3) * 35}%`,
            width: '25px',
            height: '22px',
          }}
          initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{ 
            opacity: [0, 0.4, 0.2, 0.4, 0],
            scale: [0.5, 1, 0.9, 1, 0.5],
            rotate: [0, 120, 240, 360],
            y: [0, -50, -100],
          }}
          transition={{ 
            duration: 12 + i * 1.5,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeInOut"
          }}
        >
          <div 
            className="w-full h-full bg-gradient-to-t from-gold/35 to-gold-light/20 border border-gold/20"
            style={{ 
              clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
            }}
          />
        </motion.div>
      ))}

      {/* Floating Orb Characters */}
      <motion.div
        className="absolute"
        style={{
          left: '80%',
          top: '25%',
        }}
        animate={{
          y: [0, -30, 0],
          x: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-gold/60 to-gold-light/40 shadow-gold flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-teal-darker/60" />
        </div>
      </motion.div>

      <motion.div
        className="absolute"
        style={{
          left: '10%',
          top: '45%',
        }}
        animate={{
          y: [0, 25, 0],
          x: [0, -15, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-tl from-gold/50 to-gold-light/30 shadow-gold flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-darker/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-teal-darker/50" />
          </div>
        </div>
      </motion.div>

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,175,55,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}