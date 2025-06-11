from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ValidationError
from django.core.validators import MaxLengthValidator, URLValidator, EmailValidator
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The email must be provided")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    matricule = models.CharField(max_length=100, null=True, blank=True)
    gender = models.CharField(
        max_length=10,
        choices=[('Male', 'Male'), ('Female', 'Female')],
        null=True,
        blank=True
    )
    email = models.EmailField(unique=True, null=False, blank=False)
    date_of_birth = models.DateField(null=True, blank=True)

    elections = models.ManyToManyField(
        'Election',
        related_name='participants',
        blank=True
    )

    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now=True)

    username = None
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email or "User without email"


User = get_user_model()


def validate_future_date(value):
    if value and value <= timezone.now():
        raise ValidationError("La date doit être dans le futur.")


class Election(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True, validators=[MaxLengthValidator(255)])
    description = models.TextField(max_length=1000, null=False, blank=False)
    start_date = models.DateTimeField(validators=[validate_future_date], null=True, blank=True)
    end_date = models.DateTimeField(validators=[validate_future_date], null=True, blank=True)


    created_at = models.DateTimeField(auto_now=True)

    image_file = models.ImageField(
        upload_to='election_images/',
        null=True,
        blank=True,
        help_text="Téléchargez un fichier image."
    )
    image_url = models.URLField(
        max_length=500,
        validators=[URLValidator()],
        null=True,
        blank=True,
        help_text="Ou fournissez une URL d’image."
    )

    created_by = models.ForeignKey(
        CustomUser,
        related_name='created_elections',
        on_delete=models.CASCADE,
        null=False,
        blank=False
    )

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('upcoming', 'Upcoming'),
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='draft',
        help_text="Current status of the election"
    )

    def clean(self):
        super().clean()
        if not self.image_file and not self.image_url:
            raise ValidationError("Vous devez fournir soit un fichier image, soit une URL d'image.")
        if self.image_file and self.image_url:
            raise ValidationError("Ne fournissez pas à la fois une image locale et une URL d'image.")

    def save(self, *args, **kwargs):
        if self.status:
            self.status = self.status.lower()
        self.full_clean()
        super().save(*args, **kwargs)

    def get_image(self):
        if self.image_file:
            return self.image_file.url
        return self.image_url

    def __str__(self):
        return self.name
    

class EligibleEmail(models.Model):
    id = models.AutoField(primary_key=True)
    election = models.ForeignKey(Election, related_name='eligible_emails', on_delete=models.CASCADE)
    email = models.EmailField(validators=[EmailValidator()], db_index=True)

    class Meta:
        unique_together = ('election', 'email')  # Pour éviter les doublons

    def __str__(self):
        return self.email
    
    
class Candidate(models.Model):
    id = models.AutoField(primary_key=True)
    election = models.ForeignKey(
        'Election',
        on_delete=models.CASCADE,
        related_name='candidates'  # Liste des candidats pour cette élection
    )
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(max_length=1000, null=False, blank=False)  # anciennement bio
    vote_count = models.IntegerField(default=0)
    image_file = models.ImageField(
        upload_to='candidate_images/',
        null=True,
        blank=True,
        help_text="Téléchargez un fichier image."
    )
    image_url = models.URLField(
        max_length=500,
        validators=[URLValidator()],
        null=True,
        blank=True,
        help_text="Ou fournissez une URL d’image."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.election.name}"

    class Meta:
        ordering = ['created_at']


class Vote(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    election = models.ForeignKey(Election, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'election')

    def clean(self):
        if self.candidate.election != self.election:
            raise ValidationError("Le candidat sélectionné ne fait pas partie de cette élection.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} a voté pour {self.candidate.name} ({self.election.name})"


class Message(models.Model):
    id = models.AutoField(primary_key=True)
    content = models.TextField()

    def __str__(self):
        return f"Message #{self.id}: {self.content[:50]}"
