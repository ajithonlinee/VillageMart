from django.db import models
from products.models import Product
from django.db.models.signals import post_save
from django.dispatch import receiver
import os
import requests
import threading

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
    price = models.DecimalField(max_digits=10, decimal_places=2) 

    def __str__(self):
        return f"{self.quantity} x {self.product.name if self.product else 'Unknown Product'}"


# --- TELEGRAM NOTIFICATION ENGINE ---

def telegram_worker(message_text):
    """Sends a standard HTTP request to Telegram API, bypassing Render's SMTP block."""
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    
    if not bot_token or not chat_id:
        print("Missing Telegram credentials.")
        return

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message_text,
        "parse_mode": "Markdown"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=5)
        if response.status_code == 200:
            print("✅ Telegram notification sent successfully!")
        else:
            print(f"❌ Telegram API Error: {response.text}")
    except Exception as e:
        print(f"❌ Background Telegram Error: {e}")


@receiver(post_save, sender=CustomerOrder)
def send_telegram_alert(sender, instance, created, **kwargs):
    if created:
        message = (
            f"🔔 *NEW ORDER RECEIVED*\n\n"
            f"*Order ID:* #{instance.id}\n"
            f"*Customer:* {instance.customer_name}\n"
            f"*Phone:* `{instance.phone}`\n"
            f"*Location:* {instance.street}, {instance.village}\n\n"
            f"💰 *Bill Amount:* ₹{instance.total_amount}\n\n"
            f"👉 Check Django Admin for details."
        )
        
        # Fire in background thread so checkout is instant
        threading.Thread(target=telegram_worker, args=(message,)).start()