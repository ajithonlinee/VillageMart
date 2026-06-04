import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
application = get_wsgi_application()

# Permanent Superuser Auto-Creation Layer
try:
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    # Customize your login credentials here
    username = 'ajith'
    email = 'ajithonlinee@gmail.com'
    password = 'Ajith@9059907938'  # Change this to your preferred password
    
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print(">>> Production Superuser created successfully! <<<")
except Exception as e:
    print(f"Superuser setup check skipped or already exists: {e}")