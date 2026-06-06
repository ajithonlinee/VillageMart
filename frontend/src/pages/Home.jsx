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

  return (
    <div className="flex gap-4 min-h-[calc(100vh-140px)] mt-1 items-start px-2 md:px-0">
      
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
                  className={`w-full text-left px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wide transition-all block border ${
                    isActive 
                      ? 'bg-gradient-to-r from-green-50 to-green-100/60 text-[#0C831F] border-l-4 border-[#0C831F]' 
                      : 'text-gray-600 border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      <section className="flex-grow bg-white border-2 border-gray-100 rounded-2xl p-4 md:p-6 shadow-xs w-full">
        
        <div className="border-b border-gray-100 pb-4 mb-5 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white -mx-4 md:-mx-6 px-4 md:px-6 -mt-4 md:-mt-6 rounded-t-2xl py-4">
          <div>
            <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight uppercase">
              {globalSearch 
                ? `🔍 Results for: "${globalSearch}"` 
                : `🛒 ${categories.find(c => c.id === selectedCategory)?.name || "Store Shelf"}`
              }
            </h2>
          </div>
          <span className="text-xs font-black text-[#0C831F] bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg shrink-0">
            {filteredProducts.length} IN STOCK
          </span>
        </div>

        {!globalSearch && (
          <div className="flex space-x-2 overflow-x-auto pb-3 mb-4 md:hidden no-scrollbar border-b">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id 
                    ? 'bg-[#0C831F] text-white border-[#0C831F]' 
                    : 'bg-gray-100 text-gray-600 border-transparent'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-28 bg-gray-50 rounded-2xl border border-dashed">
            <span className="text-6xl block mb-2">📦</span>
            <p className="font-black text-gray-800 text-base">Item Stack Currently Unavailable</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
            {filteredProducts.map((product) => {
              const qtyInCart = getItemQuantityInCart(product.id);
              
              let imageUrl = null;
              if (product.image && !product.image.includes('null') && product.image !== "") {
                imageUrl = product.image.startsWith('http') 
                  ? product.image 
                  : `https://villagemart-9wtl.onrender.com${product.image}`;
              }
              
              return (
                <div key={product.id} className="border-2 border-gray-100 rounded-2xl p-3 bg-white flex flex-col justify-between hover:border-yellow-400 transition-all hover:shadow-md relative group">
                  
                  <div className="w-full aspect-square rounded-xl bg-gray-50 overflow-hidden relative border border-gray-100 flex items-center justify-center text-5xl select-none">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={product.name} 
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-104"
                      />
                    ) : "🌾"}
                    
                    {product.is_available && (
                      <span className="absolute left-2 top-2 bg-[#FFF] text-black text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-md border-2 border-yellow-300 shadow-xs flex items-center space-x-1">
                        <span>⚡</span> <span className="text-[#0C831F]">20 MINS</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex-grow flex flex-col justify-between space-y-2.5">
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-[#0C831F] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[11px] font-medium text-gray-400 mt-0.5 truncate">{product.description || 'Premium selection'}</p>
                    </div>

                    <div className="pt-1 flex items-center justify-between gap-1.5 border-t border-gray-50 mt-1">
                      <div className="flex flex-col">
                        <span className="text-base font-black text-gray-900 leading-none">₹{parseFloat(product.price).toFixed(0)}</span>
                        <span className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">Retail Price</span>
                      </div>
                      
                      {qtyInCart > 0 ? (
                        <div className="flex items-center bg-[#0C831F] text-white rounded-xl font-black text-xs p-0.5 h-8 shrink-0 shadow-sm">
                          <button onClick={() => updateQuantity(product.id, -1)} className="px-2 font-black text-sm h-full rounded">-</button>
                          <span className="w-5 text-center font-black text-xs">{qtyInCart}</span>
                          <button onClick={() => updateQuantity(product.id, 1)} className="px-2 font-black text-sm h-full rounded">+</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product)}
                          className="border-2 border-[#0C831F] bg-green-50/40 hover:bg-[#0C831F] text-[#0C831F] hover:text-white px-2 md:px-4 h-8 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all truncate"
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