# views.py
from ninja import Router, Schema, UploadedFile ,File ,Form
from ninja.errors import HttpError
from typing import Optional
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Profile
from .AuthHelper import JWTAuth

auth_router = Router()

class AuthIn(Schema):
    username: str
    password: str
    email: Optional[str] = None

class AuthOut(Schema):
    access: str
    refresh: str
    username: str

class ProfileIn(Schema):
    bio: Optional[str] = None
    phone_number: Optional[str] = None
    type_of_user: Optional[str] = None

class LogoutSchema(Schema):
    refresh_token: str

@auth_router.post("/register", response=AuthOut)
def register(request, payload: AuthIn):
    if User.objects.filter(username=payload.username).exists():
        raise HttpError(400, "Username already exists")
    if payload.email and User.objects.filter(email=payload.email).exists():
        raise HttpError(400, "Email already registered")
    
    user = User.objects.create_user(
        username=payload.username,
        password=payload.password,
        email=payload.email
    )
    user = authenticate(username=payload.username, password=payload.password)
    if not user:
        raise HttpError(500, "Authentication failed after registration")
    refresh = RefreshToken.for_user(user)
    print(refresh)
    return AuthOut(
        access=str(refresh.access_token),
        refresh=str(refresh),
        username=user.username
    )


@auth_router.post("/login", response=AuthOut)
def login(request, payload: AuthIn):
    user = authenticate(username=payload.username, password=payload.password)
    if not user:
        raise HttpError(401, "Invalid credentials")
    refresh = RefreshToken.for_user(user)
    print(refresh.access_token)
    return AuthOut(
        access=str(refresh.access_token),
        refresh=str(refresh),
        username=user.username
    )

@auth_router.post("/profile-update", auth=JWTAuth())
def update_profile(
    request,
    bio: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    type_of_user: Optional[str] = Form(None),
    avatar: Optional[UploadedFile] = File(None)
):
    user = request.user
    profile, _ = Profile.objects.get_or_create(user=user)

    if bio is not None:
        profile.bio = bio
    if phone_number is not None:
        profile.phone_number = phone_number
    if type_of_user is not None:
        profile.type_of_user = type_of_user
    if avatar is not None:
        profile.avatar = avatar  # CloudinaryField automatically uploads

    profile.save()
    return {
        "detail": "Profile updated successfully",
        "avatar_url": profile.avatar.url if profile.avatar else None,
    }

@auth_router.get("/profile", auth=JWTAuth())
def get_profile(request):
    user = request.user
    try:
        profile = Profile.objects.get(user=user)
    except Profile.DoesNotExist:
        raise HttpError(404, "Profile not found")
    return {
        "username": user.username,
        "email": user.email,
        "bio": profile.bio,
        "phone_number": profile.phone_number,
        "type_of_user": profile.type_of_user,
        "avatar_url": profile.avatar.url if profile.avatar else None
    }

@auth_router.post("/logout", auth=JWTAuth())
def logout(request, payload: LogoutSchema):
    try:
        token = RefreshToken(payload.refresh_token)
        token.blacklist()
        return {"detail": "Logout successful"}
    except Exception:
        raise HttpError(400, "Invalid token")