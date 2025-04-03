from rest_framework import serializers
from ..models import *
from django.contrib.auth import authenticate

class ElectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Election
        fields = '__all__'
        
class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate  # Directly use the Candidate model
        fields = '__all__'

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = '__all__'  


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'name', 'matricule', 'gender', 'date_of_birth', 'profile_picture']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data.get('name'),
            matricule=validated_data.get('matricule'),
            gender=validated_data.get('gender'),
            date_of_birth=validated_data.get('date_of_birth'),
            profile_picture=validated_data.get('profile_picture'),
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(request=self.context.get('request'), email=email, password=password)

        if not user:
            raise serializers.ValidationError('Invalid credentials')

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'name', 'matricule', 'gender', 'date_of_birth', 'profile_picture', 'id']


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'name', 'matricule', 'gender', 'date_of_birth', 'profile_picture']

    def update(self, instance, validated_data):
        # Update user details here
        instance.email = validated_data.get('email', instance.email)
        instance.name = validated_data.get('name', instance.name)
        instance.matricule = validated_data.get('matricule', instance.matricule)
        instance.gender = validated_data.get('gender', instance.gender)
        instance.date_of_birth = validated_data.get('date_of_birth', instance.date_of_birth)
        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
        instance.save()
        return instance
