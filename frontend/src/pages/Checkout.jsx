import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Checkout = ({ cartItems, totalAmount, clearCart, backendUrl }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    house_number: '',
    street: '',
    village: 'Bhimavaram',
    landmark: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const loadRazorpayModal = (orderData) => {
    const options = {
      key: orderData.razorpay_key,
      amount: orderData.total_amount * 100, // Amount in paise
      currency: "INR",
      name: "Your Store Name",
      description: "Order Payment",
      order_id: orderData.razorpay_order_id,
      handler: async function (response) {
        setLoading(true);
        try {
          // Send signature verification details to backend
          const verifyRes = await axios.post(`${backendUrl}/api/verify-payment/`, {
            razorpay_order_id: orderData.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes.status === 200) {
            clearCart();
            navigate(`/track?order_id=${orderData.id}&phone=${formData.phone}`);
          }
        } catch (error) {
          alert("Payment verification failed. Please contact support.");
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: formData.customer_name,
        contact: formData.phone,
      },
      theme: {
        color: "#3B82F6", // Primary brand color
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
          alert("Payment cancelled by user.");
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
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
      total_amount: totalAmount,
      items: cartItems.map(item => ({
        product: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      // 1. Submit order details to backend to generate Razorpay Order ID
      const orderRes = await axios.post(`${backendUrl}/api/orders/`, payload);
      
      if (orderRes.status === 201) {
        // 2. Open the checkout modal
        loadRazorpayModal(orderRes.data);
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      alert("Failed to initialize payment. Please check your network and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      <form onSubmit={handlePlaceOrder} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleInputChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">House/Door No.</label>
            <input
              type="text"
              name="house_number"
              value={formData.house_number}
              onChange={handleInputChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Street</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Village/City</label>
            <input
              type="text"
              name="village"
              value={formData.village}
              onChange={handleInputChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Landmark (Optional)</label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-6">
          <div className="flex justify-between text-xl font-bold mb-4">
            <span>Total Payable:</span>
            <span>₹{totalAmount}</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Processing Payment..." : "Pay Securely with Razorpay"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;