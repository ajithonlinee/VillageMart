import React, { useState, useEffect } from 'react';
import API from '../services/api';

function Home({ addToCart, cart, updateQuantity, globalSearch }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          API.get('products/'),
          API.get('categories/')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
        
        if (catRes.data.length > 0) {
          setSelectedCategory(catRes.data[0].id);
        }
      } catch (error) {
        console.error("Error setting up data models from server:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = globalSearch ? true : (selectedCategory ? product.category === selectedCategory : true);
    const matchesSearch = product.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(globalSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getItemQuantityInCart = (id) => {
    const found = cart.find(item => item.id === id);
    return found ? found.quantity : 0;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-3">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0C831F] border-t-transparent"></div>
        <p className="text-gray-500 font-black text-sm uppercase tracking-wider">Gathering Fresh Stock...</p>
      </div>
    );
  }

  // Colorful emoji map function to give each category an individual icon block look
  const getCategoryEmoji = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('milk') || lower.includes('dairy')) return '🥛';
    if (lower.includes('vegetable') || lower.includes('fruit')) return '🥦';
    if (lower.includes('rice') || lower.includes('grain') || lower.includes('dal')) return '🌾';
    if (lower.includes('oil') || lower.includes('ghee')) return '🛢️';
    if (lower.includes('snack') || lower.includes('biscuit')) return '🍪';
    if (lower.includes('drink') || lower.includes('juice')) return '🧃';
    return '📦';
  };

  return (
    <div className="flex gap-4 min-h-[calc(100vh-140px)] mt-1 items-start">
      
      {/* SIDEBAR NAVIGATION: High-Contrast Fixed Ribbon List */}
      {!globalSearch && (
        <aside className="w-60 bg-white border-2 border-gray-100 rounded-2xl p-2 hidden md:block sticky top-24 h-[calc(100vh-140px)] overflow-y-auto no-scrollbar shadow-xs shrink-0">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest p-3 border-b pb-2 mb-2">Shop Categories</p>
          <div className="space-y-1">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl font-black text-xs uppercase tracking-wide transition-all flex items-center space-x-3 border ${
                    isActive 
                      ? 'bg-gradient-to-r from-green-50 to-green-100/60 text-[#0C831F] border-l-4 border-[#0C831F] shadow-xs' 
                      : 'text-gray-600 border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-xl p-1 rounded-lg ${isActive ? 'bg-white' : 'bg-gray-50'}`}>
                    {getCategoryEmoji(cat.name)}
                  </span>
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {/* RIGHT DISPLAY WORKSPACE: Ultra Colorful Grid Display Panels */}
      <section className="flex-grow bg-white border-2 border-gray-100 rounded-2xl p-4 md:p-6 shadow-xs">
        
        {/* Dynamic Header Information Card Context banner strip line */}
        <div className="border-b border-gray-100 pb-4 mb-5 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white -mx-4 md:-mx-6 px-4 md:px-6 -mt-4 md:-mt-6 rounded-t-2xl py-4">
          <div>
            <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight uppercase">
              {globalSearch 
                ? `🔍 Found Results for: "${globalSearch}"` 
                : `🛒 ${categories.find(c => c.id === selectedCategory)?.name || "Store Shelf"}`
              }
            </h2>
            <p className="text-xs text-gray-400 font-bold mt-0.5">Fresh items sourced direct from local wholesale traders</p>
          </div>
          <span className="text-xs font-black text-[#0C831F] bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg shrink-0">
            {filteredProducts.length} OPTIONS IN STOCK
          </span>
        </div>

        {/* Mobile Horizontal Pill Scroll Navigation bar container */}
        {!globalSearch && (
          <div className="flex space-x-2 overflow-x-auto pb-3 mb-4 md:hidden no-scrollbar border-b">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id 
                    ? 'bg-[#0C831F] text-white border-[#0C831F] shadow-sm' 
                    : 'bg-gray-100 text-gray-600 border-transparent'
                }`}
              >
                {getCategoryEmoji(cat.name)} {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid Loop Display Block architecture */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-28 bg-gray-50 rounded-2xl border border-dashed">
            <span className="text-6xl block mb-2">📦</span>
            <p className="font-black text-gray-800 text-base">Item Stack Currently Unavailable</p>
            <p className="text-xs text-gray-400 font-bold px-4 mt-1">We are restocking this section right now. Choose another category or modify your search words!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
            {filteredProducts.map((product) => {
              const qtyInCart = getItemQuantityInCart(product.id);
              
              // Build standard dynamic image url source path logic targeting cloud media layers
              const imageUrl = product.image 
                ? (product.image.startsWith('http') ? product.image : `https://villagemart-9wtl.onrender.com${product.image}`)
                : null;
              
              return (
                <div key={product.id} className="border-2 border-gray-100 rounded-2xl p-3 bg-white flex flex-col justify-between hover:border-yellow-400 transition-all hover:shadow-md relative group">
                  
                  {/* Media View Frame Container */}
                  <div className="w-full aspect-square rounded-xl bg-gray-50 overflow-hidden relative border border-gray-100 flex items-center justify-center text-5xl select-none">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={product.name} 
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-104"
                      />
                    ) : "🌾"}
                    
                    {/* Blashing Blinkit Style Timing Tag Badge */}
                    {product.is_available && (
                      <span className="absolute left-2 top-2 bg-[#FFF] text-black text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-md border-2 border-yellow-300 shadow-xs flex items-center space-x-1">
                        <span>⚡</span> <span className="text-[#0C831F]">20 MINS</span>
                      </span>
                    )}

                    {!product.is_available && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex items-center justify-center text-[10px] font-black text-red-600 uppercase tracking-widest border">
                        ⚠️ Sold Out
                      </div>
                    )}
                  </div>

                  {/* Body textual descriptors and price grid summary action card row */}
                  <div className="mt-3 flex-grow flex flex-col justify-between space-y-2.5">
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-[#0C831F] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[11px] font-medium text-gray-400 mt-0.5 truncate">{product.description || 'Premium local marketplace grade selection'}</p>
                    </div>

                    <div className="pt-1 flex items-center justify-between gap-1.5 border-t border-gray-50 mt-1">
                      <div className="flex flex-col">
                        <span className="text-base font-black text-gray-900 leading-none">₹{parseFloat(product.price).toFixed(0)}</span>
                        <span className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">Retail Price</span>
                      </div>
                      
                      {/* Interactive Add to Cart buttons configuration layout */}
                      {!product.is_available ? (
                        <span className="text-[9px] font-black text-gray-400 bg-gray-50 border px-2 py-2 rounded-lg uppercase">Out</span>
                      ) : qtyInCart > 0 ? (
                        <div className="flex items-center bg-[#0C831F] text-white rounded-xl font-black text-xs p-0.5 h-8 shrink-0 shadow-sm">
                          <button onClick={() => updateQuantity(product.id, -1)} className="px-2 font-black text-sm hover:bg-[#0a6d1a] h-full rounded">-</button>
                          <span className="w-5 text-center font-black text-xs">{qtyInCart}</span>
                          <button onClick={() => updateQuantity(product.id, 1)} className="px-2 font-black text-sm hover:bg-[#0a6d1a] h-full rounded">+</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product)}
                          className="border-2 border-[#0C831F] bg-green-50/40 hover:bg-[#0C831F] text-[#0C831F] hover:text-white px-4 h-8 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 shrink-0"
                        >
                          Add Item
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}

export default Home;