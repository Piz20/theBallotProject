from django.conf import settings
import sendgrid
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.viewsets import ViewSet
from rest_framework import status

class TestEmailViewSet(ViewSet):

    @action(detail=False, methods=['post'])
    def send_test_email(self, request):
        emails = request.data.get('emails', [])
        subject = request.data.get('subject', 'Test Email')
        election_id = request.data.get('election_id')
        ngrok_url = settings.NGROK_URL  # URL dynamique de ngrok

        if not election_id:
            return Response({"message": "Election ID must be provided."}, status=status.HTTP_400_BAD_REQUEST)
        if not emails:
            return Response({"message": "Aucune adresse email fournie."}, status=status.HTTP_400_BAD_REQUEST)

        election_url = f"{ngrok_url}/elections/{election_id}/"  # Lien vers l'élection via l'URL ngrok
        html_content = f"""
            <p>Ceci est un test d'envoi de mail.</p>
            <p><a href="{election_url}">Accéder à l'élection</a></p>
        """

        try:
            sg = sendgrid.SendGridAPIClient(api_key='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')

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
