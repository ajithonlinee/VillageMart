import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const Checkout = ({ cart, updateQuantity, clearCart }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    house_number: 'N/A', 
    street: '',
    village: 'Kunavaram',
    landmark: '',
  });
  const [loading, setLoading] = useState(false);

  // Dynamic script injection ensures Razorpay library loads globally
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Dynamically calculate total inside checkout component using the correct prop
  const cartTotal = (cart || []).reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const loadRazorpayModal = (orderData) => {
    if (!window.Razorpay) {
      alert("Razorpay payment gateway failed to respond. Please check your internet.");
      setLoading(false);
      return;
    }

    const options = {
      key: orderData.razorpay_key,
      amount: orderData.total_amount * 100, 
      currency: "INR",
      name: "Kunavaram Mart",
      description: "Grocery Order Payment",
      order_id: orderData.razorpay_order_id,
      handler: async function (response) {
        setLoading(true);
        try {
          // Uses your pre-configured base API utility routing setup
          const verifyRes = await API.post('verify-payment/', {
            razorpay_order_id: orderData.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes.status === 200) {
            clearCart();
            alert("Payment Successful!");
            navigate('/track', { state: { orderId: orderData.id, phone: formData.phone } });
          }
        } catch (error) {
          alert("Payment verification failed. Please check your tracking screen.");
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: formData.customer_name,
        contact: formData.phone,
      },
      theme: {
        color: "#0C831F", 
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
          alert("Payment cancelled.");
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    const activeCart = cart || [];

    if (activeCart.length === 0) {
      alert("Your basket is empty!");
      return;
    }
    setLoading(true);

    const payload = {
      customer_name: formData.customer_name,
      phone: formData.phone,
      house_number: formData.house_number,
      street: formData.street,
      village: formData.village,
      landmark: formData.landmark,
      total_amount: cartTotal,
      items: activeCart.map(item => ({
        product: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      // Replaced with native clean API configuration utility tool
      const orderRes = await API.post('orders/', payload);
      if (orderRes.status === 201) {
        loadRazorpayModal(orderRes.data);
      }
    } catch (error) {
      console.error("Order payload failed:", error.response?.data || error.message);
      alert("Failed to initialize payment. Please check backend environment configurations.");
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-4">
      
      {/* Form Container */}
      <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-black text-gray-800 border-b pb-3 mb-4">📍 Village Delivery Details</h2>
        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Full Name *</label>
              <input required type="text" name="customer_name" value={formData.customer_name} onChange={handleInputChange} className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Mobile Number *</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Street / Area Name *</label>
            <input required type="text" name="street" value={formData.street} onChange={handleInputChange} className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Village / Town *</label>
              <input required type="text" name="village" value={formData.village} onChange={handleInputChange} className="w-full p-2.5 border bg-gray-50 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Famous Landmark</label>
              <input type="text" name="landmark" value={formData.landmark} onChange={handleInputChange} className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-4 bg-[#0C831F] hover:bg-[#0a6d1a] text-white font-extrabold py-3 rounded-xl transition-all shadow-sm text-center border-b-4 border-green-900 active:scale-99 disabled:bg-gray-400">
            {loading ? "Opening Secure Gateway..." : `Pay Securely with Razorpay ₹${cartTotal}`}
          </button>
        </form>
      </div>

      {/* Basket Summary View Container */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm h-fit space-y-4">
        <h3 className="font-bold text-lg text-gray-800 border-b pb-2">Review Your Order</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {(cart || []).map(item => (
            <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
              <div>
                <p className="font-semibold text-gray-800">{item.name} <span className="text-green-600 text-xs">x{item.quantity}</span></p>
                <p className="text-xs text-gray-400">Total: ₹{item.price * item.quantity}</p>
              </div>
              <div className="flex items-center space-x-1">
                <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold">-</button>
                <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold">+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center text-lg font-black border-t pt-3 text-gray-900">
          <span>Grand Total:</span>
          <span>₹{cartTotal}</span>
        </div>
      </div>

    </div>
  );
};

export default Checkout;