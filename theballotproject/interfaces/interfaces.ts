// ====================
// Interfaces Utilisateur
// ====================
export interface User {
  id: number;
  name?: string | null;
  matricule?: string | null;
  gender?: "Male" | "Female" | null;
  email: string;
  dateOfBirth?: string | null;      // camelCase
  elections?: Election[] | null;    // liste d'élections si possible, pas any
  profilePicture?: string | null;   // camelCase
  createdAt: string;
}

// ====================
// Interfaces Candidat
// ====================
export interface Candidate {
  id?: number;
  name?: string;
  bio?: string;
  voteCount?: number;
  profilePicture?: string | null;
  createdAt?: string;
  election: Election; // objet Election complet obligatoire
}

// ====================
// Interfaces Élection
// ====================
export interface Election {
  id: number;
  name?: string;
  description?: string;
  startDate?: string;  // Date en string ISO (cohérent avec API JSON)
  endDate?: string;    // idem
  createdAt?: string;
  createdBy?: string;  // id ou email du créateur
  imageFile?: string | null;
  imageUrl?: string | null;
  eligibleEmails?: string[];
  status?: string;
  candidates?: Candidate[];  // Liste des candidats, si exposée par l'API
}

// ====================
// Interfaces Vote
// ====================
export interface Vote {
  user: number | User;
  candidate: number | Candidate;
  election: number | Election;
  createdAt: string;
}
