from rest_framework import serializers
from .models import CustomerOrder, OrderItem
from products.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']


class CustomerOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = CustomerOrder
        fields = [
            'id', 
            'customer_name', 
            'phone', 
            'house_number', 
            'street', 
            'village', 
            'landmark', 
            'total_amount', 
            'payment_status', 
            'order_status', 
            'items', 
            'created_at'
        ]

    def create(self, validated_data):
        # Extract nested order items data from the request payload
        items_data = validated_data.pop('items')
        
        # Create the primary customer order instance
        order = CustomerOrder.objects.create(**validated_data)
        
        # Save each ordered item linked directly to this new order
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
            
        return order