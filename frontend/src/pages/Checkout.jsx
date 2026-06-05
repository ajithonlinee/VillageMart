import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function Checkout({ cart, clearCart }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const totalAmount = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentAndCheckout = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill out all delivery details first.");
      return;
    }

    setLoading(true);

    // 1. Generate standard deep-link URI schema configuration parameters
    const upiAddress = '9059907938@ybl';
    const merchantName = encodeURIComponent('Village Mart');
    const transactionNote = encodeURIComponent(`Order for ${formData.name}`);
    const amount = totalAmount.toFixed(2);

    // Standard cross-platform string protocol query string layout
    const upiUrl = `upi://pay?pa=${upiAddress}&pn=${merchantName}&am=${amount}&tn=${transactionNote}&cu=INR`;

    try {
      // 2. Log delivery model records to backend system architecture securely first
      const orderPayload = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        total_amount: totalAmount,
        items: cart.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await API.post('orders/', orderPayload);

      if (response.status === 201 || response.status === 200) {
        // 3. Clear shopping context memory storage pools
        clearCart();

        // 4. Fire device native application route switcher interface 
        window.location.href = upiUrl;

        // 5. Route UI tracker records directly to success completion board banner
        navigate('/order-status', { state: { success: true, orderId: response.data.id } });
      }
    } catch (error) {
      console.error("Order checkpoint synchronization error registry log:", error);
      alert("Failed to initialize system checkout sequence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-2xl border-2 border-gray-100 max-w-xl mx-auto mt-6 shadow-xs p-6">
        <span className="text-6xl block mb-3">🛒</span>
        <h2 className="font-black text-gray-800 text-lg uppercase tracking-tight">Your basket is empty</h2>
        <p className="text-xs text-gray-400 font-bold mt-1">Add items from the homepage catalog collection before proceeding to checkout grid dashboards.</p>
        <button onClick={() => navigate('/')} className="mt-5 border-2 border-[#0C831F] bg-[#0C831F] text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#0a6d1a] transition-all active:scale-95">
          Return To Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-2 grid grid-cols-1 md:grid-cols-5 gap-4 items-start pb-12">
      
      {/* LEFT INPUT COLUMN BLOCK: Delivery Shipping Context Credentials */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-xs md:col-span-3">
        <h2 className="text-sm font-black uppercase text-gray-900 tracking-wider border-b pb-2 mb-4 flex items-center space-x-2">
          <span>📍</span> <span>Delivery Address Details</span>
        </h2>
        
        <form onSubmit={handlePaymentAndCheckout} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Customer Full Name</label>
            <input 
              type="text" 
              name="name" 
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter full name" 
              className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:border-[#0C831F] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Active Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              required
              pattern="[0-9]{10}"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter 10-digit mobile number" 
              className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:border-[#0C831F] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Complete Shipping Address (Kunavaram / Near Locations)</label>
            <textarea 
              name="address" 
              required
              rows="3"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="House Number, Street Name, Landmark details..." 
              className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:border-[#0C831F] outline-none transition-all resize-none"
            ></textarea>
          </div>

          {/* DYNAMIC INSTANT PAY SUBMIT ACTION PANEL TRIGGER BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0C831F] text-white border-2 border-[#0C831F] rounded-xl py-3.5 text-xs font-black uppercase tracking-widest hover:bg-[#0a6d1a] transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 active:scale-98"
          >
            <span>{loading ? 'PROCESSING ORDER...' : `⚡ CLICK TO PAY ₹${totalAmount.toFixed(0)}`}</span>
          </button>
        </form>
      </div>

      {/* RIGHT DISPLAY SIDEBAR SUMMARY PANEL COLUMN BLOCK */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-2 border-gray-100 rounded-2xl p-4 shadow-xs md:col-span-2 space-y-4">
        <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest border-b pb-1.5">Basket Ledger Summary</h3>
        
        <div className="max-h-52 overflow-y-auto space-y-2.5 no-scrollbar pr-1">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-xs border-b border-gray-100 pb-2">
              <div className="truncate max-w-[160px]">
                <p className="font-black text-gray-800 truncate">{item.name}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5">Qty: {item.quantity} × ₹{parseFloat(item.price).toFixed(0)}</p>
              </div>
              <span className="font-black text-gray-900 shrink-0">₹{(parseFloat(item.price) * item.quantity).toFixed(0)}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t-2 border-dashed border-gray-200 space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 uppercase tracking-wide">
            <span>Subtotal Items cost</span>
            <span>₹{totalAmount.toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-center text-[11px] font-bold text-[#0C831F] uppercase tracking-wide">
            <span>Delivery Fees (Super Saver)</span>
            <span>FREE</span>
          </div>
          <div className="flex justify-between items-center text-sm font-black text-gray-900 uppercase tracking-tight pt-1.5 border-t">
            <span>Bill Total Amount</span>
            <span className="text-base text-[#0C831F]">₹{totalAmount.toFixed(0)}</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Checkout;