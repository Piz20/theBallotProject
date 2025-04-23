from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from django.urls import reverse
from ..models import Election
from .serializers import ElectionSerializer
from ..models import CustomUser  # adapte le chemin si besoin

class ElectionViewSet(ModelViewSet):
    """
    ViewSet to manage elections.
    - GET    /api/elections/      → List all elections
    - POST   /api/elections/      → Create a new election + Send emails
    - GET    /api/elections/{id}/ → Retrieve a specific election
    - PUT    /api/elections/{id}/ → Update an election
    - DELETE /api/elections/{id}/ → Delete an election
    """
    queryset = Election.objects.all()
    serializer_class = ElectionSerializer

    def list(self, request, *args, **kwargs):
        elections = self.get_queryset()
        data = {
            'elections': ElectionSerializer(elections, many=True).data,
        }
        return Response(data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            election = serializer.save()

            # 🔗 Construction du lien absolu
            base_url = request.build_absolute_uri('/')[:-1]  # Ex: http://127.0.0.1:8000
            lien = f"{base_url}/elections/{election.id}/"
            titre = election.name

            # 👥 Récupération des utilisateurs
            user_data = list(CustomUser.objects.values("email", "name"))
            formatted_data = [
                {"email": user["email"], "prenom": user["name"] or "cher électeur"}
                for user in user_data
            ]

            # 🚀 Envoi des emails
            envoyer_emails_par_batch.delay(lien, titre, formatted_data)

            return Response({'success': True, 'message': 'Election created and emails sent!', 'data': serializer.data})

        return Response({'success': False, 'message': 'Errors in the data.', 'errors': serializer.errors}, status=400)


    def retrieve(self, request, *args, **kwargs):
        election = self.get_object()
        data = {
            'election': ElectionSerializer(election).data,
        }
        return Response(data)

    def update(self, request, *args, **kwargs):
        election = self.get_object()
        serializer = self.get_serializer(election, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Election updated successfully!', 'data': serializer.data})
        return Response({'success': False, 'message': 'Errors in the data.', 'errors': serializer.errors}, status=400)

    def partial_update(self, request, *args, **kwargs):
        election = self.get_object()
        serializer = self.get_serializer(election, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Election partially updated successfully!', 'data': serializer.data})
        return Response({'success': False, 'message': 'Errors in the data.', 'errors': serializer.errors}, status=400)

    def destroy(self, request, *args, **kwargs):
        election = self.get_object()
        election.delete()
        return Response({'success': True, 'message': 'Election deleted successfully!'})


