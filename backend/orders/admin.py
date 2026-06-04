from django.contrib import admin
from .models import CustomerOrder, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price')


@admin.register(CustomerOrder)
class CustomerOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'phone', 'total_amount', 'payment_status', 'order_status', 'created_at')
    list_filter = ('payment_status', 'order_status', 'created_at')
    search_fields = ('customer_name', 'phone', 'id')
    list_editable = ('payment_status', 'order_status')  # Owner can instantly update status
    inlines = [OrderItemInline]                          # Displays ordered items inside the order page