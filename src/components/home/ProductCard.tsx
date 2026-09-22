import { motion } from 'framer-motion';
import { ShieldCheck, Star, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  featured?: boolean;
  isHighlight?: boolean;
}

const ProductCard = ({ 
  id, 
  name, 
  category, 
  price, 
  image, 
  featured, 
  isHighlight 
}: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(id, 1, {
      id,
      name,
      price,
      images: image ? [image] : null,
      category
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Link to={`/product/${id}`} className="block">
        <div className="card-luxury overflow-hidden p-3 md:p-4">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg md:rounded-xl mb-3">
            <img
              src={image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-teal-darker/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {featured && (
                <span className="px-2 py-0.5 bg-gold text-teal-darker text-[10px] font-semibold rounded-full flex items-center gap-1">
                  <Star className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">Featured</span>
                </span>
              )}
              {isHighlight && (
                <span className="px-2 py-0.5 bg-destructive text-foreground text-[10px] font-semibold rounded-full animate-pulse-glow">
                  Hot
                </span>
              )}
            </div>

            {/* Verified Badge */}
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 rounded-full bg-teal flex items-center justify-center">
                <ShieldCheck className="w-3 h-3 text-gold" />
              </div>
            </div>

            {/* Quick Add Button */}
            <button 
              onClick={handleAddToCart}
              className="absolute bottom-2 right-2 w-9 h-9 md:w-10 md:h-10 rounded-full bg-gold text-teal-darker flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
            >
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-1">
            <span className="text-[10px] md:text-xs text-gold uppercase tracking-wider">
              {category}
            </span>
            <h3 className="font-serif font-semibold text-sm md:text-base text-foreground line-clamp-1">
              {name}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-base md:text-lg font-bold text-gold">
                Le {price.toLocaleString()}
              </p>
              {/* Mobile Add Button */}
              <button 
                onClick={handleAddToCart}
                className="md:hidden w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
