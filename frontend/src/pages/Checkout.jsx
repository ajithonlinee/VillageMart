import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import API from '../services/api';



function Checkout({ cart, clearCart, updateQuantity }) {

  const navigate = useNavigate();

  

  // Set the Shop Owner's payment details here

  const SHOP_UPI_ID = "ajithmaddirala@ybl"; // Replace with your verified shop UPI ID

  const SHOP_NAME = "myshop Kunavaram";



  const [formData, setFormData] = useState({

    customer_name: '',

    phone: '',

    house_number: 'N/A', // Hardcoded to N/A so the Django backend doesn't reject the order

    street: '',

    village: 'Kunavaram',

    landmark: ''

  });

  

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);



  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);



  const handleInputChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

  };



  // 1. Handle Order Initiation & Form Validation

  const handlePlaceOrderClick = (e) => {

    e.preventDefault();

    if (cart.length === 0) return alert("Your basket is empty!");

    

    // Open the direct payment modal

    setShowPaymentModal(true);

  };



  // 2. Finalize Submission to Backend API after user pays

  const handlePaymentConfirmedByUser = async () => {

    setIsSubmitting(true);

    try {

      // Map global cart state into matching Django OrderItem array format

      const formattedItems = cart.map(item => ({

        product: item.id,

        quantity: item.quantity,

        price: item.price

      }));



      const payload = {

        ...formData,

        total_amount: cartTotal,

        items: formattedItems

      };



      const response = await API.post('orders/', payload);

      

      // Clear local basket and redirect to Tracking dashboard

      clearCart();

      setShowPaymentModal(false);

      alert(`Order Placed Successfully! Your Order ID is #${response.data.id}`);

      navigate('/track', { state: { orderId: response.data.id, phone: response.data.phone } });

    } catch (error) {

      console.error("Error creating order payload:", error.response?.data || error.message);

      alert("Failed to submit order. Please check your network connection.");

    } finally {

      setIsSubmitting(false);

    }

  };



  // Generate deep-linking standard UPI string format

  const upiString = `upi://pay?pa=${SHOP_UPI_ID}&pn=${encodeURIComponent(SHOP_NAME)}&am=${cartTotal}&cu=INR&tn=${encodeURIComponent('Order Payment at myshop')}`;

  

  // Create an instant scannable QR Code address via public charts API

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;



  if (cart.length === 0 && !showPaymentModal) {

    return (

      <div className="text-center py-16 bg-white border rounded-2xl max-w-xl mx-auto my-8 p-8 shadow-sm">

        <span className="text-5xl">🛒</span>

        <h2 className="text-xl font-bold mt-4 text-gray-800">Your basket is completely empty</h2>

        <p className="text-gray-500 text-sm mt-1">Head back to the catalog to select fresh items.</p>

        <button onClick={() => navigate('/')} className="mt-6 bg-green-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-green-700">

          Back to Homepage

        </button>

      </div>

    );

  }



  return (

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-4">

      

      {/* Left Column: Core Delivery Address Fields Form */}

      <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

        <h2 className="text-xl font-black text-gray-800 border-b pb-3 mb-4">📍 Village Delivery Details</h2>

        

        <form onSubmit={handlePlaceOrderClick} className="space-y-4">

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



          <button type="submit" className="w-full mt-4 bg-green-600 text-white font-extrabold py-3 rounded-xl hover:bg-green-700 transition-colors shadow-sm text-center">

            Proceed to Pay ₹{cartTotal}

          </button>

        </form>

      </div>



      {/* Right Column: Complete Summary Basket List */}

      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm h-fit space-y-4">

        <h3 className="font-bold text-lg text-gray-800 border-b pb-2">Review Your Order</h3>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">

          {cart.map(item => (

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



      {/* DYNAMIC UPI POPUP MODAL */}

      {showPaymentModal && (

        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">

          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border animate-fade-in">

            <h3 className="text-xl font-black text-gray-900">Scan or Click to Pay</h3>

            <p className="text-xs text-gray-500 px-2">

              Pay exactly <span className="font-bold text-gray-800 text-sm">Target: ₹{cartTotal}</span> using any UPI App (PhonePe, Google Pay, Paytm, BHIM).

            </p>



            {/* Scannable Automated QR Render Box */}

            <div className="bg-gray-50 p-3 rounded-xl inline-block border mx-auto shadow-inner">

              <img src={qrCodeUrl} alt="UPI Payment QR" className="mx-auto max-w-[200px]" />

            </div>



            {/* Deep-link Action Button targeting mobile layouts */}

            <div className="space-y-2">

              <a href={upiString} className="block w-full bg-blue-600 text-white text-sm font-bold py-2 rounded-xl hover:bg-blue-700 transition-colors">

                📱 Click to Pay on Mobile

              </a>

              <p className="text-[10px] text-gray-400">If on desktop, scan the QR code above with your mobile phone camera/UPI app.</p>

            </div>



            <div className="border-t pt-3 bg-green-50/50 p-3 rounded-xl border border-green-100">

              <p className="text-xs text-gray-600 font-medium mb-2">👉 Paid already? Click below to save your order details for shop delivery confirmation.</p>

              <div className="flex space-x-2">

                <button disabled={isSubmitting} onClick={() => setShowPaymentModal(false)} className="w-1/3 border border-gray-300 text-gray-700 py-1.5 rounded-xl text-xs font-bold hover:bg-gray-50">

                  Cancel

                </button>

                <button disabled={isSubmitting} onClick={handlePaymentConfirmedByUser} className="w-2/3 bg-green-600 text-white py-1.5 rounded-xl text-xs font-bold hover:bg-green-700 shadow-sm">

                  {isSubmitting ? "Processing..." : "I Have Paid Successfully"}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}



    </div>

  );

}



export default Checkout;