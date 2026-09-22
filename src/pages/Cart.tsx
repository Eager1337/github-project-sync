import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Minus, Plus, Trash2, ArrowLeft, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CheckoutDialog from '@/components/CheckoutDialog';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const navigate = useNavigate();

  const orderItems = items.map((item) => ({
    product_id: item.product_id,
    name: item.product?.name ?? 'Product',
    price: item.product?.price ?? 0,
    quantity: item.quantity,
    image_url: item.product?.images?.[0] ?? null,
  }));


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 md:pt-40 pb-32 md:pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
            <h1 className="text-2xl md:text-4xl font-serif font-bold">
              Your <span className="text-gold-gradient">Cart</span>
            </h1>
          </motion.div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-serif font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Discover our amazing products!</p>
              <Link to="/categories" className="btn-gold inline-flex items-center gap-2">
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-xl p-4 flex gap-4 border border-border"
                  >
                    <Link to={`/product/${item.product_id}`} className="flex-shrink-0">
                      <img
                        src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200'}
                        alt={item.product?.name}
                        className="w-20 h-24 md:w-28 md:h-32 object-cover rounded-lg"
                      />
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product_id}`}>
                        <h3 className="font-serif font-semibold text-sm md:text-base line-clamp-1 hover:text-gold transition-colors">
                          {item.product?.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-gold uppercase tracking-wider mb-2">
                        {item.product?.category}
                      </p>
                      <p className="text-lg font-bold text-gold">
                        Le {item.product?.price?.toLocaleString()}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-gold/20 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-gold/20 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl p-6 border border-border sticky top-32">
                  <h2 className="text-lg font-serif font-bold mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                      <span>Le {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="text-gold">Free</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-gold">Le {totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCheckoutOpen(true)}
                    className="w-full btn-gold py-4 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Order via WhatsApp
                  </button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Complete your order through WhatsApp for fastest service
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={orderItems}
        onPlaced={() => {
          clearCart();
          navigate('/my-orders');
        }}
      />
    </div>
  );
};

export default Cart;
