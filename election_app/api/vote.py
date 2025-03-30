from rest_framework import viewsets, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import Candidate, Vote
from .serializers import VoteSerializer

class VoteViewSet(viewsets.ModelViewSet):
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    # Supprimer ou commenter cette ligne pour tester sans authentification
    # permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        candidate_id = request.data.get('candidate_id')

        if not candidate_id:
            return Response({'error': 'Missing candidate_id'}, status=status.HTTP_400_BAD_REQUEST)

        # Récupérer le candidat avec l'ID spécifié
        candidate = get_object_or_404(Candidate, id=candidate_id)

        # L'élection est récupérée via l'attribut `election` du candidat
        election = candidate.election

        # Vérifier si l'utilisateur a déjà voté dans cette élection
        existing_vote = Vote.objects.filter(user=request.user, candidate__election=election).first()

        if existing_vote:
            if existing_vote.candidate != candidate:
                # Mettre à jour le vote en changeant de candidat
                existing_vote.candidate.vote_count -= 1
                existing_vote.candidate.save()

                existing_vote.candidate = candidate
                existing_vote.save()

                candidate.vote_count += 1
                candidate.save()

                return Response({'success': True, 'message': 'Your vote has been updated successfully.'}, status=status.HTTP_200_OK)
            else:
                return Response({'success': True, 'message': 'You have already voted for this candidate.'}, status=status.HTTP_200_OK)

        # Si l'utilisateur n'a pas encore voté, créer un nouveau vote
        Vote.objects.create(user=request.user, candidate=candidate)
        candidate.vote_count += 1
        candidate.save()

        return Response({'success': True, 'message': 'Your vote has been recorded successfully.'}, status=status.HTTP_201_CREATED)
