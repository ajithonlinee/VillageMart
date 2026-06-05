import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function OrderStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const orderDetails = location.state || null;

  if (!orderDetails) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <h2 className="font-black text-gray-800 text-xl uppercase">No Order Found</h2>
        <button onClick={() => navigate('/')} className="mt-4 bg-[#0C831F] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest">
          Return To Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 px-4 pb-12">
      <div className="bg-white border-2 border-green-500 rounded-2xl shadow-sm overflow-hidden text-center">
        
        <div className="bg-green-50 py-8 border-b-2 border-green-100">
          <span className="text-6xl block mb-2">✅</span>
          <h1 className="text-2xl font-black text-[#0C831F] uppercase tracking-tight">Order Placed!</h1>
          <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">Waiting for payment confirmation</p>
        </div>

        <div className="p-6 space-y-4 text-left">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</span>
              <span className="text-xs font-black text-gray-900">#{orderDetails.orderId}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</span>
              <span className="text-xs font-black text-gray-900">{orderDetails.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Paid</span>
              <span className="text-xs font-black text-[#0C831F]">₹{parseFloat(orderDetails.amount).toFixed(0)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 font-bold text-center leading-relaxed px-2">
            Your order is confirmed and is being packed. It will be delivered to your address in Kunavaram within 20 minutes!
          </p>

          <button 
            onClick={() => navigate('/')} 
            className="w-full mt-4 bg-[#0C831F] text-white border-2 border-[#0C831F] rounded-xl py-3.5 text-xs font-black uppercase tracking-widest hover:bg-[#0a6d1a] transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderStatus;