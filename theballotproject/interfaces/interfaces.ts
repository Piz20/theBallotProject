// ====================
// Interfaces Utilisateur
// ====================
export interface User {
  id: number;
  name?: string | null;
  matricule?: string | null;
  gender?: "Male" | "Female" | null;
  email: string;
  dateOfBirth?: string | null;      // ✅ camelCase
  elections?: any | null;           // JSONField (structure à préciser si possible)
  profilePicture?: string | null;   // ✅ camelCase
  createdAt: string;
}

// ====================
// Interfaces Candidat
// ====================
// types/Candidate.ts

export interface Candidate {
  id: number;
  election: {
    id: number;
    name: string;
  };
  name: string;
  bio: string;
  vote_count: number;
  profile_picture?: string | null;
  created_at: string;
}


// ====================
// Interfaces Élection
// ====================
export interface Election {
  id: number;
  name: string;
  description: string;
  startDate: Date;                // ✅ camelCase
  endDate: Date;
  createdAt: string;
  imageFile?: string | null;        // ✅ camelCase
  imageUrl?: string | null;         // ✅ camelCase
  eligibleVoters: User[];           // ✅ camelCase
  candidates?: Candidate[];
  status: string;
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
