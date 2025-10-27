from ninja.security import HttpBearer
from rest_framework_simplejwt.authentication import JWTAuthentication

class JWTAuth(HttpBearer):
    def authenticate(self, request, token):
        validated = JWTAuthentication().get_validated_token(token)
        user = JWTAuthentication().get_user(validated)
        request.user = user
        return token