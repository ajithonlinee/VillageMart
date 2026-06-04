from rest_framework import serializers
from .models import Category, Product

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 
            'category', 
            'category_name', 
            'name', 
            'price', 
            'description', 
            'image', 
            'stock', 
            'is_available', 
            'created_at'
        ]


class CategorySerializer(serializers.ModelSerializer):
    # This inclusion brings all related products along when fetching a category
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'products']