import { gql } from '@apollo/client';

export const RUN_AI_QUERY = gql`
  query RunAIQuery($prompt: String!) {
    run(prompt: $prompt) {
      sql_query
      data
      error
    }
  }
`;

/**
 * GraphQL query pour exécuter une requête SQL générée par l'IA et retourner du HTML D3.js pour les graphiques.
 * Le champ 'runForGraphs' correspond à `resolve_run_for_graphs` dans votre schéma Graphene.
 */
export const RUN_FOR_GRAPHS_AI_QUERY = gql`
  query RunForGraphsAIQuery($prompt: String!) {
    runForGraphs(prompt: $prompt)
  }
`;

/**
 * GraphQL query pour effectuer une recherche d'utilisateurs assistée par l'IA.
 * Le champ 'voterSearch' correspond à `resolve_voter_search` dans votre schéma Graphene.
 */
export const VOTER_SEARCH_QUERY = gql`
  query VoterSearch($prompt: String!) {
    voterSearch(prompt: $prompt)
  }
`;

/**
 * GraphQL query pour récupérer automatiquement des statistiques clés pour le tableau de bord.
 * Le champ 'autoDashboardStats' correspond à `resolve_auto_dashboard_stats` dans votre schéma Graphene.
 */
export const AUTO_DASHBOARD_STATS_QUERY = gql`
  query AutoDashboardStats {
    autoDashboardStats
  }
`;
