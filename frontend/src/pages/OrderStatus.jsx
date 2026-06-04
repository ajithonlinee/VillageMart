import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../services/api';

function OrderStatus() {
  const location = useLocation();
  
  const [searchParams, setSearchParams] = useState({
    order_id: '',
    phone: ''
  });

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill tracking credentials if redirected from the Checkout page
  useEffect(() => {
    if (location.state && location.state.orderId && location.state.phone) {
      const { orderId, phone } = location.state;
      setSearchParams({ order_id: orderId, phone: phone });
      fetchOrderStatus(orderId, phone);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!searchParams.order_id || !searchParams.phone) {
      return setError('Please enter both your Order ID and Mobile Number.');
    }
    fetchOrderStatus(searchParams.order_id, searchParams.phone);
  };

  const fetchOrderStatus = async (id, phoneNum) => {
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const response = await API.get(`track/?order_id=${id}&phone=${phoneNum}`);
      setOrder(response.data);
    } catch (err) {
      console.error("Tracking API error response:", err.response?.data);
      setError(err.response?.data?.error || 'No matching order found. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Helper styling tracker map to clean up status display strings
  const getStatusLabelAndColor = (status, type) => {
    const mappings = {
      PENDING: { label: 'Pending Verification', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      CONFIRMED: { label: 'Order Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      PACKED: { label: 'Packed & Ready', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      OUT_FOR_DELIVERY: { label: 'Out for Delivery 🛵', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      DELIVERED: { label: 'Delivered Successfully ✅', color: 'bg-green-100 text-green-800 border-green-200' },
      REJECTED: { label: 'Payment Rejected ❌', color: 'bg-red-100 text-red-800 border-red-200' },
      CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    };
    return mappings[status] ? mappings[status][type] : status;
  };

  return (
    <div className="max-w-2xl mx-auto my-6 space-y-6">
      
      {/* Search Input Box Panel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-black text-gray-800 mb-2">📦 Track Your Village Order</h2>
        <p className="text-xs text-gray-500 mb-4">Enter your details below to view payment verification and delivery progress updates.</p>
        
        <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Order ID</label>
            <input required type="text" name="order_id" value={searchParams.order_id} onChange={handleInputChange} placeholder="e.g., 1" className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Mobile Number</label>
            <input required type="tel" name="phone" value={searchParams.phone} onChange={handleInputChange} placeholder="e.g., 98765..." className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-2.5 rounded-xl hover:bg-green-700 transition-colors shadow-sm text-sm">
            {loading ? 'Searching...' : 'Check Status'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Tracking Results Panel Layout Display */}
      {order && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
          
          {/* Header State Summary Card */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-2">
            <div>
              <h3 className="text-lg font-black text-gray-900">Order Reference #{order.id}</h3>
              <p className="text-xs text-gray-400">Placed on: {new Date(order.created_at).toLocaleString()}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusLabelAndColor(order.payment_status, 'color')}`}>
                Payment: {getStatusLabelAndColor(order.payment_status, 'label')}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusLabelAndColor(order.order_status, 'color')}`}>
                Delivery: {getStatusLabelAndColor(order.order_status, 'label')}
              </span>
            </div>
          </div>

          {/* Delivery Flow Timeline Graphics Visualization */}
          <div>
            <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3">Delivery Progress</h4>
            <div className="grid grid-cols-5 text-center text-[10px] md:text-xs font-bold text-gray-400 relative">
              
              {/* Progress highlights conditionally based on running database status fields */}
              <div className={['PENDING', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.order_status) ? 'text-green-600' : ''}>
                <div className="mx-auto w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 border border-gray-300 mb-1 text-xs">⏳</div>
                Pending
              </div>
              <div className={['CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.order_status) ? 'text-green-600' : ''}>
                <div className="mx-auto w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 border border-gray-300 mb-1 text-xs">👍</div>
                Confirmed
              </div>
              <div className={['PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.order_status) ? 'text-green-600' : ''}>
                <div className="mx-auto w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 border border-gray-300 mb-1 text-xs">📦</div>
                Packed
              </div>
              <div className={['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.order_status) ? 'text-green-600' : ''}>
                <div className="mx-auto w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 border border-gray-300 mb-1 text-xs">🛵</div>
                On the Way
              </div>
              <div className={order.order_status === 'DELIVERED' ? 'text-green-600' : ''}>
                <div className="mx-auto w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 border border-gray-300 mb-1 text-xs">🏠</div>
                Arrived
              </div>

            </div>
          </div>

          {/* Customer Address Details Summary Block Grid */}
          <div className="bg-gray-50 p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-400 mb-1">Customer Delivery Details</h4>
              <p className="font-bold text-gray-800">{order.customer_name}</p>
              <p className="text-gray-600">{order.phone}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-400 mb-1">Destination Address</h4>
              <p className="text-gray-700">House No: {order.house_number}, {order.street}</p>
              <p className="text-gray-700">{order.village} Village</p>
              {order.landmark && <p className="text-xs text-gray-500 italic mt-0.5">Landmark: {order.landmark}</p>}
            </div>
          </div>

          {/* Ordered Basket Items Summary List Table */}
          <div>
            <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Items Ordered</h4>
            <div className="border rounded-xl divide-y bg-white overflow-hidden text-sm">
              {order.items?.map((item) => (
                <div key={item.id} className="p-3 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-gray-800">{item.product_name || 'Item'}</span>
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">x{item.quantity}</span>
                  </div>
                  <span className="font-bold text-gray-900">₹{parseFloat(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="p-3 bg-gray-50/50 flex justify-between items-center font-black text-gray-900 text-base">
                <span>Total Bill Amount:</span>
                <span>₹{parseFloat(order.total_amount).toFixed(0)}</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default OrderStatus;