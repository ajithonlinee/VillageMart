import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Checkout = ({ cartItems, totalAmount, clearCart, backendUrl }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    house_number: 'N/A', // Default to avoid backend structure conflicts
    street: '',
    village: 'Kunavaram',
    landmark: '',
  });
  const [loading, setLoading] = useState(false);

  // DYNAMIC SCRIPT INJECTION: Loads Razorpay SDK directly through React code
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const loadRazorpayModal = (orderData) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load. Please check your internet connection.");
      setLoading(false);
      return;
    }

    const options = {
      key: orderData.razorpay_key || "rzp_test_your_key_here",
      amount: orderData.total_amount * 100, // Amount in paise
      currency: "INR",
      name: "Kunavaram Mart",
      description: "Grocery Order Payment",
      order_id: orderData.razorpay_order_id,
      handler: async function (response) {
        setLoading(true);
        try {
          const verifyRes = await axios.post(`https://villagemart-9wtl.onrender.com/api/verify-payment/`, {
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
        color: "#0C831F", // Kunavaram Mart Green Brand Color
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
    
    // Safety check to parse cart elements accurately
    const activeCart = cartItems || [];
    const activeTotal = totalAmount || 0;

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
      total_amount: activeTotal,
      items: activeCart.map(item => ({
        product: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      const orderRes = await axios.post(`https://villagemart-9wtl.onrender.com/api/orders/`, payload);
      if (orderRes.status === 201) {
        loadRazorpayModal(orderRes.data);
      }
    } catch (error) {
      console.error("Order payload failed:", error.response?.data || error.message);
      alert("Failed to initialize payment order check logs.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 shadow-sm my-4">
      <h2 className="text-xl font-black text-gray-800 border-b pb-3 mb-4">📍 Delivery & Checkout</h2>
      <form onSubmit={handlePlaceOrder} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Full Name *</label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleInputChange}
            required
            className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Mobile Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Street / Area Name *</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            required
            className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Village / Town *</label>
            <input
              type="text"
              name="village"
              value={formData.village}
              onChange={handleInputChange}
              required
              className="w-full p-2.5 border bg-gray-50 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Famous Landmark</label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleInputChange}
              className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-6">
          <div className="flex justify-between items-center text-lg font-black text-gray-900 mb-4">
            <span>Grand Total:</span>
            <span>₹{totalAmount || 0}</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0C831F] hover:bg-[#0a6d1a] text-white font-black py-3 rounded-xl transition-all shadow-md text-center border-b-4 border-green-900 active:scale-99 disabled:bg-gray-400"
          >
            {loading ? "Opening Secure Gateway..." : `Pay Securely with Razorpay`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;