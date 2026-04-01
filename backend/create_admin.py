import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

if not User.objects.filter(username="admin").exists():
    User.objects.create_superuser(
        username="admin",
        email="admin@example.com",
        password="admin123",
        role="ADMIN"
    )
else:
    user = User.objects.get(username="admin")
    if not user.role:
        user.role = "ADMIN"
        user.save()
        print("Updated admin role to ADMIN")
