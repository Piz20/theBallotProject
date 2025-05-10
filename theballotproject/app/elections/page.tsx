"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import Link from "next/link";
import Footer from "@/components/ui/footer";
import {
  Vote,
  Plus,
  ChevronRight,
  Users,
  BarChart3,
  Calendar,
  Search,
  LogOut,
  Settings,
  Bell,
  User,
  LineChart,
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/loader";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LOGOUT_USER } from "@/lib/mutations/userMutations";
import { useToastStore } from "@/hooks/useToastStore";
import { Toaster } from "@/components/ui/toaster";
import { GET_ALL_ELECTIONS } from "@/lib/mutations/electionMutations";
import { useQuery } from "@apollo/client";
import { Election } from "@/interfaces/interfaces";
// Fonction de recherche
export interface SearchOptions<T> {
  query: string;
  items: T[];
  keys: (keyof T)[];
  exactMatch?: boolean;
}





const RANDOM_IMAGES = [
  "https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg",
  "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
  "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg",
  "https://images.pexels.com/photos/1509582/pexels-photo-1509582.jpeg",
  "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
  "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
];
const mapElectionData = (apiData: any[]): Election[] => {
  return apiData.map((item, index) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    startDate: item.startDate,
    endDate: item.endDate,
    createdAt: item.createdAt,
    status: new Date(item.endDate) > new Date() ? 
      (new Date(item.startDate) <= new Date() ? "Ongoing" : "Upcoming") : 
      "Completed",
    imageUrl: RANDOM_IMAGES[index % RANDOM_IMAGES.length],
    eligibleVoters: item.eligibleVoters || 0 // Default to 0 if not provided
  }));
};

export default function DashboardPage() {
  const { loading, error, data } = useQuery(GET_ALL_ELECTIONS);
  const [elections, setElections] = useState<Election[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredElections, setFilteredElections] = useState<Election[]>([]);

  
  const [logout] = useMutation(LOGOUT_USER);
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToastStore();

  // Update elections when data is loaded
  useEffect(() => {
    if (data && data.allElections) {
      const mappedData = mapElectionData(data.allElections);
      setElections(mappedData);
      setFilteredElections(mappedData);
    }
  }, [data]);

  // Filter elections when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredElections(elections);
      return;
    }

    const normalizedQuery = searchTerm.trim().toLowerCase();
    const filtered = elections.filter(election => 
      election.name.toLowerCase().includes(normalizedQuery) ||
      election.description.toLowerCase().includes(normalizedQuery) ||
      election.status.toLowerCase().includes(normalizedQuery)
    );
    
    setFilteredElections(filtered);
  }, [searchTerm, elections]);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const res = await logout();
      const success = res?.data?.logoutUser?.details;

      if (success) {
        addToast({
          title: "Success!",
          message: "Goodbye 👋 !",
          variant: "success",
        });
        setTimeout(() => {
          router.push("/auth");
        }, 1500);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      setIsLoading(false);
    }
  };

  



  return (
    <>

      <title>TheBallotProject - Elections</title>

      <div className="min-h-screen bg-gradient-to-br from-background to-background/90">
        {/* Navbar */}
        <nav className="bg-gray-100 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Vote className="h-8 w-8 text-primary heartbeat" />
                  <span className="text-xl font-bold">TheBallotProject</span>
                </div>
                <div className="hidden md:flex items-center gap-6">
                  <Link href="/elections" className="text-gray-700 hover:text-primary">
                    <Vote className="h-4 w-4 inline-block mr-1" />
                    Elections
                  </Link>
                  <Link href="/elections/statistics" className="text-gray-700 hover:text-primary">
                    <LineChart className="h-4 w-4 inline-block mr-1" />
                    Statistics
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary">
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-destructive"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  ) : (
                    <LogOut className="h-5 w-5" />
                  )}
                </Button>

                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </nav>
        -
        <div className="container mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Elections</h1>
            <Button asChild>
              <Link href="/elections/create">
                <Plus className="mr-2 h-5 w-5" />
                Créer une élection
              </Link>
            </Button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-primary/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Élections actives
                </CardTitle>
                <Vote className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  +2 ce mois
                </p>
              </CardContent>
            </Card>
            <Card className="bg-primary/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Participants totaux
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">234</div>
                <p className="text-xs text-muted-foreground">
                  +18% vs mois dernier
                </p>
              </CardContent>
            </Card>
            <Card className="bg-primary/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Taux de participation
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">
                  +12% vs dernière élection
                </p>
              </CardContent>
            </Card>
          </div>
          <Toaster/>
          {/* Barre de recherche */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une élection (nom, date, description...)..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

            {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
            <span className="ml-2 text-gray-600">Loading elections...</span>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            <p>Error loading elections: {error.message}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredElections.map((election) => (
              <div 
                key={election.id} 
                className="group hover:shadow-lg transition-shadow duration-200 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
              >
                <div 
                  className="h-48 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${election.imageUrl})` }}
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      election.status === "Ongoing" ? "bg-green-100 text-green-800 animate-pulse" :
                      election.status === "Upcoming" ? "bg-blue-100 text-blue-800 animate-pulse" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {election.status}
                    </span>
                    <Calendar className="h-4 w-4 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{election.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{election.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        10 eligible voters
                      </span>
                    </div>
                    <button className="text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                      View details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Start: {new Date(election.startDate).toLocaleDateString()}</span>
                      <span>End: {new Date(election.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </div>
        {/* footer */}
        <Footer />
      </div>

    </>);
}

