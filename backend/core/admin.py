from django.contrib import admin

from .models import ExtesionScan, UploadImage,Session

# Register your models here.
admin.site.register(UploadImage)
admin.site.register(Session)
admin.site.register(ExtesionScan)