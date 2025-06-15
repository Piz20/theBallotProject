import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, BarChart3, Users } from 'lucide-react';

interface AIAnalysisProps {
  candidates: any[];
  totalVotes: number;
  isElectionEnded: boolean;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ candidates, totalVotes, isElectionEnded }) => {
  const [analysis, setAnalysis] = useState('');
  const [prediction, setPrediction] = useState('');
  
  useEffect(() => {
    // Simuler l'analyse IA en temps réel
    const generateAnalysis = () => {
      if (totalVotes === 0) {
        setAnalysis("En attente des premiers votes pour commencer l'analyse...");
        setPrediction("Aucune prédiction disponible");
        return;
      }

      const leader = candidates.reduce((prev, current) => 
        prev.votes > current.votes ? prev : current
      );

      const secondPlace = candidates
        .filter(c => c.id !== leader.id)
        .reduce((prev, current) => prev.votes > current.votes ? prev : current);

      const leadPercentage = ((leader.votes / totalVotes) * 100).toFixed(1);
      const margin = leader.votes - secondPlace.votes;

      if (isElectionEnded) {
        setAnalysis(`🏆 Élection terminée ! ${leader.name} remporte la victoire avec ${leadPercentage}% des votes (${leader.votes} votes au total). Marge de victoire: ${margin} votes.`);
        setPrediction(`Résultat final confirmé: ${leader.name} est élu(e) !`);
      } else {
        setAnalysis(`📊 Tendance actuelle: ${leader.name} mène avec ${leadPercentage}% des votes. Participation: ${totalVotes} votes enregistrés. La course reste ${margin < 10 ? 'très serrée' : margin < 50 ? 'compétitive' : 'dominée par le leader'}.`);
        
        if (margin < 10) {
          setPrediction("🔥 Course très serrée ! Le résultat final reste imprévisible.");
        } else if (margin < 50) {
          setPrediction(`⚖️ ${leader.name} a un avantage, mais rien n'est encore joué.`);
        } else {
          setPrediction(`📈 ${leader.name} semble bien parti(e) pour remporter l'élection.`);
        }
      }
    };

    generateAnalysis();
    
    if (!isElectionEnded) {
      const interval = setInterval(generateAnalysis, 3000);
      return () => clearInterval(interval);
    }
  }, [candidates, totalVotes, isElectionEnded]);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-8 border border-indigo-200">
      <div className="flex items-center mb-4">
        <Brain className="text-indigo-600 mr-3" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Analyse IA en Temps Réel</h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <BarChart3 className="text-blue-500 mr-2" size={20} />
            <h3 className="font-semibold text-gray-700">Analyse Actuelle</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{analysis}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <TrendingUp className="text-green-500 mr-2" size={20} />
            <h3 className="font-semibold text-gray-700">Prédiction</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{prediction}</p>
        </div>
      </div>
      
      <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center mb-3">
          <Users className="text-purple-500 mr-2" size={20} />
          <h3 className="font-semibold text-gray-700">Statistiques</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalVotes}</div>
            <div className="text-sm text-gray-500">Votes totaux</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{candidates.length}</div>
            <div className="text-sm text-gray-500">Candidats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalVotes > 0 ? ((Math.max(...candidates.map(c => c.votes)) / totalVotes) * 100).toFixed(0) : 0}%
            </div>
            <div className="text-sm text-gray-500">Score leader</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {isElectionEnded ? '100' : Math.floor(Math.random() * 40 + 30)}%
            </div>
            <div className="text-sm text-gray-500">Participation</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;