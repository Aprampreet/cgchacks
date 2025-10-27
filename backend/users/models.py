from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField

class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True, null=True)
    avatar = CloudinaryField('avatar', blank=True, null=True,folder="avatars" ,default='https://res.cloudinary.com/ds1qsfajw/image/upload/v1761071644/avatars/ge0hluzvf07rpdsu2kyd.jpg')  
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    type_of_user = models.CharField(
        max_length=50,
        choices=[
            ('Individual', 'Individual'),
            ('Business', 'Business'),
            ('Student', 'Student'),
        ],
        default='Individual'
    )
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
