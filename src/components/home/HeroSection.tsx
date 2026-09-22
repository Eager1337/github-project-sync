import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Play, Pause, Volume2, VolumeX, Download, Smartphone, Monitor } from 'lucide-react';
import FloatingDiamonds from '../3d/FloatingDiamonds';
import Product3DMockup from './Product3DMockup';

const heroVideos = [
  'https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=164&oauth2_token_id=57447761',
  'https://player.vimeo.com/external/371844187.sd.mp4?s=c6d13d25c20c8f90e837b0e6b10a13ccdb49e0db&profile_id=164&oauth2_token_id=57447761',
  'https://player.vimeo.com/external/371445028.sd.mp4?s=d3daab8c2faa0e4a4b7668f9b0e8d5e4b05f9c8b&profile_id=164&oauth2_token_id=57447761',
];

const HeroSection = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length);
      setVideoLoaded(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentVideoIndex]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVideoIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <video
              ref={videoRef}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              onLoadedData={() => setVideoLoaded(true)}
              className="w-full h-full object-cover"
            >
              <source src={heroVideos[currentVideoIndex]} type="video/mp4" />
            </video>
          </motion.div>
        </AnimatePresence>
        
        {/* Fallback Image */}
        {!videoLoaded && (
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop"
            alt="Fashion Hero"
            className="w-full h-full object-cover absolute inset-0"
          />
        )}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute inset-0 bg-teal-darker/40" />
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:text-gold transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:text-gold transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </motion.button>
        
        {/* Video Indicators */}
        <div className="flex gap-2 ml-4">
          {heroVideos.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentVideoIndex(i);
                setVideoLoaded(false);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentVideoIndex ? 'bg-gold w-6' : 'bg-foreground/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Floating Elements - Hidden on mobile for performance */}
      <div className="hidden md:block">
        <FloatingDiamonds />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-24 md:pt-32">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-block px-3 py-1.5 md:px-4 md:py-2 bg-gold/20 border border-gold/40 rounded-full text-gold text-xs md:text-sm font-medium mb-4 md:mb-6">
                ✨ New Collection 2026
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-bold leading-tight mb-4 md:mb-6"
            >
              Elegance{' '}
              <span className="text-gold-gradient italic">Redefined</span>
              <br />
              For Modern Life.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-sm md:text-lg text-foreground/80 mb-6 md:mb-8 max-w-lg"
            >
              Discover the finest selection of luxury dresses, wedding essentials, 
              and premium accessories in Freetown.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 md:gap-4"
            >
              <Link to="/daily-drops" className="btn-gold flex items-center justify-center gap-2 text-sm md:text-base py-3 md:py-4">
                Shop Daily Drops
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
              <a href="#download" className="btn-outline-gold flex items-center justify-center gap-2 text-sm md:text-base py-3 md:py-4">
                <Download className="w-4 h-4 md:w-5 md:h-5" />
                Get the App
              </a>
            </motion.div>

            {/* Platform badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex items-center gap-2 mt-2"
            >
              <span className="text-xs text-muted-foreground">Available on:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { icon: Smartphone, label: 'iOS' },
                  { icon: Smartphone, label: 'Android' },
                  { icon: Monitor, label: 'Windows' },
                  { icon: Smartphone, label: 'macOS' },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="flex items-center gap-1 px-2 py-1 rounded-full bg-card/80 backdrop-blur-sm border border-border text-gold text-[11px] font-medium">
                    <Icon className="w-3 h-3" />
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* 3D Product Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="hidden lg:block"
          >
            <Product3DMockup />
          </motion.div>
        </div>

        {/* Stats - Repositioned for mobile */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-8 md:mt-0 md:absolute md:right-6 md:bottom-32 bg-card/80 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-border"
        >
          <div className="flex md:flex-col gap-6 md:gap-4 justify-center">
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-2xl md:text-4xl font-bold text-gold">10k+</span>
              <div className="text-xs md:text-sm text-foreground/60">
                <div className="font-medium text-foreground">Satisfied</div>
                Fashionistas
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-2xl md:text-4xl font-bold text-gold">24/7</span>
              <div className="text-xs md:text-sm text-foreground/60">
                <div className="font-medium text-foreground">Live Market</div>
                Updates
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
