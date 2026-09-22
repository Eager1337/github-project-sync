import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, ShieldCheck, Heart, Share2, ChevronLeft, ChevronRight, ShoppingBag, Minus, Plus, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { openWhatsApp, buildProductMessage } from '@/lib/whatsapp';
import { inWishlist, toggleWishlist } from '@/lib/wishlist';
import TikTokEmbed from '@/components/TikTokEmbed';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/home/ProductCard';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  stock: number;
  images: string[] | null;
  videos: string[] | null;
  featured: boolean;
  is_highlight: boolean;
  tiktok_url?: string | null;
}

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (data) {
        setProduct(data);
        setSaved(inWishlist(data.id));
        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', id)
          .limit(4);
        if (related) setRelatedProducts(related);
      }
      setLoading(false);
    };
    fetchProduct();
    setCurrentImageIndex(0);
    setQuantity(1);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product.id, quantity, {
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
      category: product.category
    });
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;
    
    openWhatsApp(buildProductMessage(product, quantity));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-28 md:pt-40 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-lg bg-gold flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-teal-darker font-serif font-bold text-xl">H</span>
            </div>
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-28 md:pt-40 container mx-auto px-4 md:px-6 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <h1 className="text-2xl md:text-3xl font-serif text-foreground mb-4">Product Not Found</h1>
          <Link to="/" className="btn-gold inline-block text-sm md:text-base">Back to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 md:pt-40 pb-32 md:pb-20">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold mb-4 md:mb-8 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-12">
            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden mb-3">
                <img
                  src={images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1)}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 backdrop-blur flex items-center justify-center text-foreground hover:bg-gold hover:text-teal-darker transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1)}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 backdrop-blur flex items-center justify-center text-foreground hover:bg-gold hover:text-teal-darker transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                {product.featured && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-gold text-teal-darker text-xs font-semibold rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Featured
                  </span>
                )}
                {product.is_highlight && (
                  <span className="absolute top-3 right-3 px-3 py-1 bg-destructive text-foreground text-xs font-semibold rounded-full animate-pulse">
                    Hot 🔥
                  </span>
                )}
              </div>
              
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        i === currentImageIndex ? 'border-gold' : 'border-transparent opacity-70'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Videos */}
              {product.videos && product.videos.length > 0 && (
                <div className="mt-4 md:mt-6">
                  <h3 className="text-sm md:text-lg font-semibold text-foreground mb-2 md:mb-3">Product Videos</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {product.videos.map((video, i) => (
                      <video key={i} controls className="rounded-lg w-full">
                        <source src={video} type="video/mp4" />
                      </video>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 md:space-y-6">
              <div>
                <span className="text-gold uppercase tracking-wider text-xs">{product.category}</span>
                <h1 className="text-2xl md:text-4xl font-serif font-bold text-foreground mt-1">{product.name}</h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-3xl md:text-4xl font-bold text-gold">Le {product.price.toLocaleString()}</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  <span className="text-xs">Verified Seller</span>
                </div>
              </div>

              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {product.description || 'Experience luxury with this premium product from Haamkay Enterprises. Quality guaranteed with fast delivery across Freetown.'}
              </p>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm ${product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-destructive/20 text-destructive'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-gold/20 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-gold/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="btn-gold flex-1 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleWhatsAppOrder}
                  className="btn-outline-gold flex items-center gap-2 px-6"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </button>
              </div>

              <div className="hidden md:flex gap-3 pt-2">
                <button
                  onClick={() => {
                    if (!product) return;
                    const now = toggleWishlist({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.images?.[0] ?? null,
                      category: product.category,
                    });
                    setSaved(now);
                  }}
                  className={`flex items-center gap-2 text-sm transition-colors ${saved ? 'text-gold' : 'text-muted-foreground hover:text-gold'}`}
                >
                  <Heart className={`w-4 h-4 ${saved ? 'fill-gold' : ''}`} />
                  {saved ? 'Saved to Wishlist' : 'Add to Wishlist'}
                </button>
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </motion.div>
          </div>

          {product.tiktok_url && (
            <div className="mt-12 md:mt-16">
              <h2 className="text-lg md:text-2xl font-serif font-bold text-foreground mb-4">See it on TikTok</h2>
              <TikTokEmbed url={product.tiktok_url} className="max-w-md" />
            </div>
          )}


          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12 md:mt-20">
              <h2 className="text-lg md:text-2xl font-serif font-bold text-foreground mb-4 md:mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {relatedProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    category={p.category}
                    price={p.price}
                    image={p.images?.[0] || ''}
                    featured={p.featured}
                    isHighlight={p.is_highlight}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border md:hidden">
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 btn-gold py-3 flex items-center justify-center gap-2 text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </button>
          <button
            onClick={handleWhatsAppOrder}
            className="w-12 h-12 rounded-xl bg-green-600 text-white flex items-center justify-center"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
