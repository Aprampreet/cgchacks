from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField


class UploadImage(models.Model): 
    image_url = models.FileField(upload_to='images/')  
    file_id = models.CharField(max_length=255)  
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image {self.id} - {self.uploaded_at}"
    

class Session(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
    ]
    STATUS_CHOICES = [
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ]
    user  = models.ForeignKey(User, on_delete=models.CASCADE)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    input_media = CloudinaryField('input_media',resource_type='auto',folder='input_media/')
    processed_media = CloudinaryField('processed_media',resource_type='auto',folder='processed_media/', null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    result_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Session {self.id} - {self.media_type} - {self.status}"
    
class ExtesionScan(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
    ]
    url = models.URLField()
    input_media = CloudinaryField('input_media',resource_type='auto',folder='extension_scan_input/')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    result_data = models.JSONField(null=True, blank=True)
    scanned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ExtensionScan {self.id} - {self.media_type} - {self.url}"