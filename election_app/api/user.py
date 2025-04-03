from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import login, logout
from rest_framework.authtoken.models import Token
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer, UserUpdateSerializer
from ..models import CustomUser

class UserViewSet(viewsets.GenericViewSet):
    queryset = CustomUser.objects.all()
    
    def create(self, request, *args, **kwargs):
        # Register a new user
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'success': True,
                'message': 'User registered successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        # Handle login
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'success': True,
                'message': 'Login successful',
                'token': token.key
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        # Handle logout
        request.user.auth_token.delete()
        return Response({
            'success': True,
            'message': 'Logout successful'
        })
    
    @action(detail=False, methods=['delete'])
    def delete_account(self, request):
        # Handle account deletion
        request.user.delete()
        return Response({
            'success': True,
            'message': 'Your account has been deleted successfully'
        })
        
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update user profile information (PUT and PATCH)."""
        user = request.user  # Get the logged-in user
        serializer = UserUpdateSerializer(user, data=request.data, partial=(request.method == 'PATCH'))

        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Your profile has been updated successfully.',
                'user': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        """Retrieve a list of users."""
        users = self.get_queryset()
        data = {
            'users': UserSerializer(users, many=True).data,
        }
        return Response(data)

    def retrieve(self, request, pk=None):
        """Retrieve a single user."""
        user = self.get_object()
        serializer = UserSerializer(user)
        return Response(serializer.data)
