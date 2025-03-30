from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from ..models import Election
from .serializers import ElectionSerializer

class ElectionViewSet(ModelViewSet):
    """
    ViewSet to manage elections.
    - GET    /api/elections/      → List all elections
    - POST   /api/elections/      → Create a new election
    - GET    /api/elections/{id}/ → Retrieve a specific election
    - PUT    /api/elections/{id}/ → Update an election
    - DELETE /api/elections/{id}/ → Delete an election
    """
    queryset = Election.objects.all()
    serializer_class = ElectionSerializer

    def list(self, request, *args, **kwargs):
        """ Retrieve all elections """
        elections = self.get_queryset()
        data = {
            'elections': ElectionSerializer(elections, many=True).data,
        }
        return Response(data)

    def create(self, request, *args, **kwargs):
        """ Create a new election """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Election created successfully!', 'data': serializer.data})
        return Response({'success': False, 'message': 'Errors in the data.', 'errors': serializer.errors}, status=400)

    def retrieve(self, request, *args, **kwargs):
        """ Retrieve a specific election """
        election = self.get_object()  # Get the election by ID
        data = {
            'election': ElectionSerializer(election).data,
        }
        return Response(data)

    def update(self, request, *args, **kwargs):
        """ Update an election """
        election = self.get_object()  # Get the election by ID
        serializer = self.get_serializer(election, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Election updated successfully!', 'data': serializer.data})
        return Response({'success': False, 'message': 'Errors in the data.', 'errors': serializer.errors}, status=400)

    def partial_update(self, request, *args, **kwargs):
        """ Partially update an election """
        election = self.get_object()  # Get the election by ID
        serializer = self.get_serializer(election, data=request.data, partial=True)  # Use partial=True for partial update
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Election partially updated successfully!', 'data': serializer.data})
        return Response({'success': False, 'message': 'Errors in the data.', 'errors': serializer.errors}, status=400)

    def destroy(self, request, *args, **kwargs):
        """ Delete an election """
        election = self.get_object()  # Get the election by ID
        election.delete()  # Delete the election
        return Response({'success': True, 'message': 'Election deleted successfully!'})
