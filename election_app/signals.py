
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from .models import Election

@receiver(post_save, sender=Election)
def envoyer_email_election(sender, instance, created, **kwargs):
    User = get_user_model()

    if created:  # On envoie l'e-mail uniquement à la création de l'élection
        utilisateurs = User.objects.all()
        for user in utilisateurs:
            print(user.email)
        emails = [user.email for user in utilisateurs if user.email]  # Liste des emails valides
        
        if emails:
            lien_vote = f"{settings.SITE_URL}/elections/{instance.id}/"  # URL locale vers la page de vote
            sujet = "Nouvelle Élection Disponible"
            message = f"Une nouvelle élection a été créée. Vous pouvez voter en cliquant sur ce lien : {lien_vote}"
            
            send_mail(sujet, message, settings.DEFAULT_FROM_EMAIL, emails)
