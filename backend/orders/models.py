from django.db import models
from products.models import Product

class CustomerOrder(models.Model):
    # Payment Status Choices
    PAYMENT_PENDING = 'PENDING'
    PAYMENT_CONFIRMED = 'CONFIRMED'
    PAYMENT_REJECTED = 'REJECTED'
    
    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_PENDING, 'Pending Verification'),
        (PAYMENT_CONFIRMED, 'Confirmed'),
        (PAYMENT_REJECTED, 'Rejected'),
    ]

    # Order Status Choices
    STATUS_PENDING = 'PENDING'
    STATUS_CONFIRMED = 'CONFIRMED'
    STATUS_PACKED = 'PACKED'
    STATUS_OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY'
    STATUS_DELIVERED = 'DELIVERED'
    STATUS_CANCELLED = 'CANCELLED'

    ORDER_STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending Verification'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_PACKED, 'Packed'),
        (STATUS_OUT_FOR_DELIVERY, 'Out For Delivery'),
        (STATUS_DELIVERED, 'Delivered'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    # Customer Details
    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15)
    
    # Address Details
    house_number = models.CharField(max_length=50)
    street = models.CharField(max_length=150)
    village = models.CharField(max_length=100, default="Bhimavaram")
    landmark = models.CharField(max_length=150, blank=True, null=True)
    
    # Order Specifics
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default=PAYMENT_PENDING)
    order_status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default=STATUS_PENDING)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(CustomerOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2) # Price locked at time of purchase

    def __str__(self):
        return f"{self.quantity} x {self.product.name if self.product else 'Unknown Product'}"