from rest_framework import generics, status
from rest_framework.response import Response
from .models import CustomerOrder
from .serializers import CustomerOrderSerializer

class OrderListCreateAPIView(generics.ListCreateAPIView):
    """
    Handles listing all placed orders (for admin) and creating new orders (for checkout).
    """
    queryset = CustomerOrder.objects.all()
    serializer_class = CustomerOrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Save the order instance and trigger stock adjustments if needed
            order = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    Handles retrieving individual order details, updating tracking states, or deleting an order.
    """
    queryset = CustomerOrder.objects.all()
    serializer_class = CustomerOrderSerializer


class OrderTrackingAPIView(generics.GenericAPIView):
    """
    Enables clients to track order statuses instantly using a combination 
    of their order ID and associated phone number. No login required.
    """
    serializer_class = CustomerOrderSerializer

    def get(self, request, *args, **kwargs):
        order_id = request.query_params.get('order_id')
        phone = request.query_params.get('phone')

        if not order_id or not phone:
            return Response(
                {"error": "Please provide both order_id and phone parameters."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = CustomerOrder.objects.get(id=order_id, phone=phone)
            serializer = self.get_serializer(order)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CustomerOrder.DoesNotExist:
            return Response(
                {"error": "No matching order found with the provided details."},
                status=status.HTTP_444_NOT_FOUND if False else status.HTTP_404_NOT_FOUND
            )