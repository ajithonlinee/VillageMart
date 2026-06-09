from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
import razorpay
import threading
from .models import CustomerOrder, telegram_worker
from .serializers import CustomerOrderSerializer

# Initialize Razorpay Client
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class OrderListCreateAPIView(generics.ListCreateAPIView):
    queryset = CustomerOrder.objects.all()
    serializer_class = CustomerOrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save()
            
            # 1. Create a Razorpay Order
            razorpay_order = client.order.create({
                "amount": int(order.total_amount * 100), # Razorpay uses paise (multiply by 100)
                "currency": "INR",
                "receipt": f"order_rcptid_{order.id}",
                "payment_capture": "1"
            })
            
            # 2. Save the Razorpay Order ID to our database
            order.razorpay_order_id = razorpay_order['id']
            order.save()
            
            # 3. Send order details + razorpay key to frontend
            response_data = serializer.data
            response_data['razorpay_order_id'] = razorpay_order['id']
            response_data['razorpay_key'] = settings.RAZORPAY_KEY_ID
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyPaymentAPIView(APIView):
    """Verifies the signature returned by Razorpay after a successful payment."""
    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        try:
            order = CustomerOrder.objects.get(razorpay_order_id=razorpay_order_id)
            
            # Verify the payment signature with Razorpay
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            client.utility.verify_payment_signature(params_dict)
            
            # If successful, mark as paid
            order.payment_status = 'CONFIRMED'
            order.order_status = 'CONFIRMED'
            order.razorpay_payment_id = razorpay_payment_id
            order.razorpay_signature = razorpay_signature
            order.save()
            
            # Fire Telegram Alert (Only happens when money is actually paid)
            message = (
                f"✅ *PAID ORDER RECEIVED*\n\n"
                f"*Order ID:* #{order.id}\n"
                f"*Customer:* {order.customer_name}\n"
                f"*Phone:* `{order.phone}`\n"
                f"*Location:* {order.street}, {order.village}\n\n"
                f"💰 *Amount Paid:* ₹{order.total_amount}\n\n"
                f"👉 Start packing!"
            )
            threading.Thread(target=telegram_worker, args=(message,)).start()
            
            return Response({'status': 'Payment verified successfully'}, status=status.HTTP_200_OK)
            
        except razorpay.errors.SignatureVerificationError:
            return Response({'error': 'Invalid payment signature'}, status=status.HTTP_400_BAD_REQUEST)
        except CustomerOrder.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

class OrderDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomerOrder.objects.all()
    serializer_class = CustomerOrderSerializer

class OrderTrackingAPIView(generics.GenericAPIView):
    serializer_class = CustomerOrderSerializer

    def get(self, request, *args, **kwargs):
        order_id = request.query_params.get('order_id')
        phone = request.query_params.get('phone')

        if not order_id or not phone:
            return Response({"error": "Please provide both order_id and phone parameters."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = CustomerOrder.objects.get(id=order_id, phone=phone)
            serializer = self.get_serializer(order)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CustomerOrder.DoesNotExist:
            return Response({"error": "No matching order found."}, status=status.HTTP_404_NOT_FOUND)