from django.conf import settings
import sendgrid
import graphene
import os
from rest_framework.response import Response
from rest_framework.decorators import action



class SendTestEmail(graphene.Mutation):
    class Arguments:
        emails = graphene.List(graphene.String, required=True)
        subject = graphene.String(default_value="Test Email")
        election_id = graphene.Int(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, emails, election_id, subject):
        local_tunnel_url = settings.LOCAL_TUNNEL_URL
        api_key = os.getenv('SENDGRID_API_KEY')

        if not election_id:
            return SendTestEmail(success=False, message="Election ID must be provided.")

        if not emails:
            return SendTestEmail(success=False, message="Aucune adresse email fournie.")

        election_url = f"{local_tunnel_url}/elections/{election_id}/"
        html_content = f"""
            <p>Ceci est un test d'envoi de mail.</p>
            <p><a href="{election_url}">Accéder à l'élection</a></p>
        """

        try:
            sg = sendgrid.SendGridAPIClient(api_key=api_key)

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
                    return SendTestEmail(success=False, message=f"Erreur lors de l'envoi à {email}: {response.body.decode()}")

            return SendTestEmail(success=True, message="Emails envoyés avec succès.")

        except Exception as e:
            return SendTestEmail(success=False, message=f"Erreur lors de l'envoi : {str(e)}")

class Mutation(graphene.ObjectType):
    send_test_email = SendTestEmail.Field()

schema = graphene.Schema( mutation=Mutation)
