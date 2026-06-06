import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Home from './pages/Home';
import Checkout from './pages/Checkout';
import OrderStatus from './pages/OrderStatus';

function App() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('myshop_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('myshop_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, amount) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + amount;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => setCart([]);

  const totalItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <Router>
      <div className="min-h-screen flex flex-col selection:bg-yellow-200">
        
        {/* Top Promotional Bar */}
        <div className="bg-[#1C2028] text-white text-center py-1.5 text-[9px] sm:text-[11px] font-black tracking-wide uppercase px-2 flex items-center justify-center space-x-2 shrink-0">
          <span>⚡ SUPER SAVER WEEK — FREE DELIVERY TODAY! ⚡</span>
        </div>

        {/* Sticky Blinkit High-Contrast Header */}
        <header className="bg-[#FFF] border-b-2 border-yellow-300 sticky top-0 z-40 shadow-md">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Branding Logo Block */}
            <div className="flex items-center space-x-2 sm:space-x-6 shrink-0">
              <Link to="/" className="text-xl sm:text-3xl font-extrabold tracking-tighter select-none flex items-center">
                <span className="bg-[#F7D10A] text-black px-2 sm:px-3 py-1 rounded-xl shadow-xs border border-black/10">Kunavaram</span>
                <span className="text-[#0C831F] font-black ml-1 sm:ml-1.5">mart</span>
              </Link>
              
              {/* Location Badge (Hidden on mobile to save space) */}
              <div className="hidden lg:block bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                <p className="text-[10px] font-black text-[#0C831F] uppercase tracking-wider">⏱️ 20 MINS DELIVERY</p>
                <p className="text-xs font-bold text-gray-800 truncate max-w-[150px]">Kunavaram, AP</p>
              </div>
            </div>

            {/* Expansive Search Console */}
            <div className="flex-grow max-w-xl relative hidden sm:block">
              <span className="absolute left-4 top-3.5 text-lg">🔍</span>
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder='Search "fresh milk", "rice bag"...'
                className="w-full bg-[#F4F6FB] border-2 border-gray-100 rounded-xl py-3 pl-12 pr-4 text-sm font-semibold focus:outline-none focus:bg-white focus:border-[#0C831F] shadow-inner transition-all placeholder-gray-400"
              />
            </div>

            {/* Right Side Utility Dashboard Controls */}
            <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
              <Link to="/track" className="text-[10px] sm:text-sm font-extrabold text-gray-700 hover:text-[#0C831F] bg-gray-100 hover:bg-green-50 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all border border-gray-200/60 flex items-center">
                <span className="mr-1">🚚</span>
                <span className="hidden sm:inline">Track Order</span>
                <span className="sm:hidden">Track</span>
              </Link>
              
              {/* Giant Flashing Green Blinkit Cart Box */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="bg-[#0C831F] hover:bg-[#0a6d1a] text-white px-3 py-2 sm:px-5 sm:py-3 rounded-xl font-black flex items-center space-x-1.5 sm:space-x-4 shadow-md hover:shadow-lg transition-all active:scale-97 border-b-4 border-green-900 shrink-0"
              >
                <span className="text-base sm:text-xl">🛒</span>
                {totalItemsCount > 0 ? (
                  <div className="text-left leading-none flex items-center sm:block">
                    <p className="hidden sm:block font-black text-yellow-300 text-[10px] uppercase tracking-wider mb-0.5">{totalItemsCount} Items Placed</p>
                    <div className="flex items-center gap-1.5">
                      <span className="sm:hidden bg-white text-[#0C831F] px-1.5 py-0.5 rounded text-[10px]">{totalItemsCount}</span>
                      <p className="text-sm sm:text-base font-extrabold">₹{cartTotal}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs sm:text-sm font-black tracking-wide">Basket</span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Embedded Search Strip */}
          <div className="p-2 sm:p-3 bg-white border-t border-gray-100 sm:hidden">
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm">🔍</span>
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search village essentials..."
                className="w-full bg-gray-100 border rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>
        </header>

        {/* Global Body Container */}
        <main className="flex-grow max-w-7xl w-full mx-auto p-2 sm:p-4 md:py-6">
          <Routes>
            <Route 
              path="/" 
              element={<Home addToCart={addToCart} cart={cart} updateQuantity={updateQuantity} globalSearch={globalSearch} />} 
            />
            <Route 
              path="/checkout" 
              element={<Checkout cart={cart} clearCart={clearCart} updateQuantity={updateQuantity} />} 
            />
            <Route 
              path="/track" 
              element={<OrderStatus />} 
            />
          </Routes>
        </main>

        {/* Sliding Sidebar Cart Menu Layout */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsCartOpen(false)} />
            
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-drawer border-l border-gray-100">
                
                {/* Header Card summary line panel */}
                <div className="p-4 bg-[#F4F6FB] border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">My Basket Dashboard</h2>
                    <p className="text-xs text-gray-500 font-bold">Delivery straight to your house doorstep</p>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="bg-white border text-gray-700 shadow-xs hover:bg-gray-100 font-black rounded-full w-8 h-8 flex items-center justify-center">✕</button>
                </div>

                {/* Items Container Body viewport loop list */}
                <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-gray-50/50">
                  {cart.length === 0 ? (
                    <div className="text-center py-32 space-y-3">
                      <div className="text-7xl">🧃</div>
                      <p className="font-black text-gray-800 text-lg">Your cart is entirely empty</p>
                      <p className="text-xs text-gray-400 font-semibold px-8">Fill it with fresh farm produce, groceries, and daily essentials from our local market stalls.</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="bg-white border-2 border-gray-100 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs">
                        <div className="w-14 h-14 bg-gray-50 border rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-2xl font-bold">
                          {item.image ? <img src={item.image} alt={item.name} className="object-cover w-full h-full" /> : "📦"}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-gray-400 font-bold">{item.category_name}</p>
                          <p className="text-sm font-black text-gray-900 mt-1">₹{parseFloat(item.price).toFixed(0)}</p>
                        </div>
                        
                        {/* Interactive Plus Minus Incremental Pill Badge Controls */}
                        <div className="flex items-center bg-[#0C831F] text-white rounded-lg p-0.5 shrink-0 shadow-xs">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 font-black rounded text-base hover:bg-[#0a6d1a] transition-colors">-</button>
                          <span className="font-black text-sm w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 font-black rounded text-base hover:bg-[#0a6d1a] transition-colors">+</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Sticky Subtotal Checkout Drawer Panel Card bottom line */}
                {cart.length > 0 && (
                  <div className="p-4 border-t border-gray-200 bg-white space-y-4 shadow-2xl">
                    <div className="bg-[#F4F6FB] p-3 rounded-xl space-y-1.5 text-xs font-bold text-gray-600">
                      <div className="flex justify-between"><span>Items subtotal price</span><span className="text-gray-900 font-extrabold">₹{cartTotal}</span></div>
                      <div className="flex justify-between text-[#0C831F]"><span>Local handling & packing fee</span><span>FREE</span></div>
                      <div className="flex justify-between border-t pt-2 text-base font-black text-gray-900"><span>Grand Bill Amount</span><span className="text-xl text-[#0C831F]">₹{cartTotal}</span></div>
                    </div>
                    
                    <Link 
                      to="/checkout" 
                      onClick={() => setIsCartOpen(false)}
                      className="block text-center w-full bg-[#0C831F] hover:bg-[#0a6d1a] text-white font-black py-4 rounded-xl transition-all shadow-md text-base border-b-4 border-green-900 active:scale-99"
                    >
                      Proceed to Secure Checkout ➔
                    </Link>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs font-bold text-gray-400 mt-12">
          <p>© 2026 Villagemart Hyperlocal Express Commerce Logistics Delivery Hub.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;