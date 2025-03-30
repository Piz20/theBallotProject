from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import Candidate, Election
from .serializers import CandidateSerializer


class CandidateViewSet(ModelViewSet):
    """
    ViewSet to manage candidates for an election.
    - GET    /api/candidates/        → List all candidates
    - POST   /api/candidates/        → Create a new candidate
    - GET    /api/candidates/{id}/   → Retrieve a candidate
    - PUT    /api/candidates/{id}/   → Update a candidate
    - DELETE /api/candidates/{id}/   → Delete a candidate
    """

    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer

    def list(self, request, *args, **kwargs):
        """ Retrieve all candidates """
        candidates = self.get_queryset()
        return Response({'candidates': CandidateSerializer(candidates, many=True).data})

    def create(self, request, *args, **kwargs):
        """ Create a new candidate """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Candidate created successfully!', 'data': serializer.data})
        return Response({'success': False, 'message': 'Invalid data.', 'errors': serializer.errors}, status=400)

    def update(self, request, *args, **kwargs):
        """ Update a candidate """
        candidate = self.get_object()
        serializer = self.get_serializer(candidate, data=request.data, partial=True)  # Allow partial updates
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Candidate updated successfully!', 'data': serializer.data})
        return Response({'success': False, 'message': 'Invalid data.', 'errors': serializer.errors}, status=400)

    def destroy(self, request, *args, **kwargs):
        """ Delete a candidate """
        candidate = self.get_object()
        candidate.delete()
        return Response({'success': True, 'message': 'Candidate deleted successfully!'}, status=status.HTTP_204_NO_CONTENT)