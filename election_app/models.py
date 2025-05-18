from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ValidationError
from django.core.validators import MaxLengthValidator, URLValidator
from django.db import models
from django.utils import timezone
from django.db import models
from django.contrib.auth import get_user_model


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """Creates and returns a user with an email."""
        if not email:
            raise ValueError("The email must be provided")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Creates and returns a superuser with an email."""
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
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female')], null=True, blank=True)
    email = models.EmailField(unique=True, null=False, blank=False)
    date_of_birth = models.DateField(null=True, blank=True)
    elections = models.JSONField(null=True, blank=True)

    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now=True)  # auto_now = mise à jour à chaque changement

    # Remove username field
    username = None
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email or "User without email"


# Obtention du modèle utilisateur, ici CustomUser
User = get_user_model()

def validate_future_date(value):
    """Validation pour s'assurer que la date est dans le futur."""
    if value and value <= timezone.now():
        raise ValidationError("La date doit être dans le futur.")

class Election(models.Model):
  
    id = models.AutoField(primary_key=True)
    name = models.CharField(
        max_length=255,
        unique=True,
        validators=[MaxLengthValidator(255)]
    )
    description = models.TextField(
        validators=[MaxLengthValidator(1000)],
        null=False,
        blank=False
    )
    start_date = models.DateTimeField(validators=[validate_future_date], null=True, blank=True)
    end_date = models.DateTimeField(validators=[validate_future_date], null=True, blank=True)
    
    eligible_voters = models.ManyToManyField(
        User,
        related_name='eligible_elections',
        blank=True
    )
    created_at = models.DateTimeField(auto_now=True)

    image_file = models.ImageField(
        upload_to='election_images/',
        null=True,
        blank=True,
        help_text=("Téléchargez un fichier image.")
    )
    image_url = models.URLField(
        max_length=500,
        validators=[URLValidator()],
        null=True,
        blank=True,
        help_text=("Ou fournissez une URL d’image.")
    )

    created_by = models.ForeignKey(
        User,
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
        self.full_clean()
        super().save(*args, **kwargs)

    def get_image(self):
        if self.image_file:
            return self.image_file.url
        return self.image_url

    def __str__(self):
        return self.name



# Candidate class
class Candidate(models.Model):
    id = models.AutoField(primary_key=True)
    election = models.ForeignKey(
        Election,
        on_delete=models.CASCADE,
        related_name='candidates'  # Relation inverse accessible via `election.candidates`
    )
    name = models.CharField(max_length=255, unique=True)  # Le nom doit être unique
    bio = models.TextField(max_length=1000, null=False, blank=False)  # La bio doit être unique
    vote_count = models.IntegerField(default=0)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)  # Date de création du candidat

    def __str__(self):
        return f"{self.name} - {self.election.name}"

    class Meta:
        ordering = ['created_at']  # Optionnel : pour trier les candidats par date de création


class Vote(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    election = models.ForeignKey(Election, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now=True)  # auto_now = mise à jour à chaque changement

    class Meta:
        unique_together = ('user', 'election')  # Empêche les doublons

    def clean(self):
        # Assure que le candidat appartient bien à l’élection
        if self.candidate.election != self.election:
            raise ValidationError("Le candidat sélectionné ne fait pas partie de cette élection.")

    def save(self, *args, **kwargs):
        self.full_clean()  # Appelle clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} a voté pour {self.candidate.name} ({self.election.name})"


