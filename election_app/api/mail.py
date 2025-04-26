from django.conf import settings
import sendgrid
import os
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.viewsets import ViewSet
from rest_framework import status
from dotenv import load_dotenv

load_dotenv()
        # Récupération de la clé API SendGrid depuis les variables d'environnement
class TestEmailViewSet(ViewSet):

    @action(detail=False, methods=['post'])
    def send_test_email(self, request):
        emails = request.data.get('emails', [])
        subject = request.data.get('subject', 'Test Email')
        election_id = request.data.get('election_id')
        local_tunnel_url = settings.LOCAL_TUNNEL_URL 
        
        
        api_key = os.getenv('SENDGRID_API_KEY')
        

        if not election_id:
            return Response({"message": "Election ID must be provided."}, status=status.HTTP_400_BAD_REQUEST)
        if not emails:
            return Response({"message": "Aucune adresse email fournie."}, status=status.HTTP_400_BAD_REQUEST)

        election_url = f"{local_tunnel_url}/elections/{election_id}/"  # Lien vers l'élection via l'URL ngrok
        html_content = f"""
            <p>Ceci est un test d'envoi de mail.</p>
            <p><a href="{election_url}">Accéder à l'élection</a></p>
        """

        try:
            sg = sendgrid.SendGridAPIClient(api_key=api_key)
            # Envoi de l'email à chaque adresse fournie

            for email in emails:
                data = {
                    "personalizations": [{
                        "to": [{"email": email}],
                        "subject": subject
                    }],
                    "from": {"email": settings.DEFAULT_FROM_EMAIL},
                    "content": [{
                        "type": "text/html",
                        "value": html_content
                    }]
                }

                response = sg.client.mail.send.post(request_body=data)

                if response.status_code >= 400:
                    return Response({
                        "message": f"Erreur lors de l'envoi à {email}",
                        "details": response.body.decode()
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({"message": "Emails envoyés avec succès."})

        except Exception as e:
            return Response({"message": "Erreur lors de l'envoi", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
