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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LOGOUT_USER } from "@/lib/mutations/userMutations";

// Fonction de recherche
export interface SearchOptions<T> {
  query: string;
  items: T[];
  keys: (keyof T)[];
  exactMatch?: boolean;
}

function searchItems<T>({ query, items, keys, exactMatch = false }: SearchOptions<T>): T[] {
  if (!query.trim()) return items;

  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) =>
    keys.some((key) => {
      const value = item[key];
      if (typeof value !== "string") return false;
      const normalizedValue = value.toLowerCase();
      return exactMatch
        ? normalizedValue === normalizedQuery
        : normalizedValue.includes(normalizedQuery);
    })
  );
}

// Interface pour une élection
interface Election {
  id: number;
  title: string;
  description: string;
  status: string;
  participants: number;
  endDate: string;
  image: string;
}

/// Mock data
const elections: Election[] = [
  {
    id: 1,
    title: "Executive Board Election 2024",
    description: "Annual election to renew the executive board",
    status: "Ongoing",
    participants: 145,
    endDate: "2024-04-15",
    image: "https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg",
  },
  {
    id: 2,
    title: "Student Representatives",
    description: "Election of student representatives for the academic year",
    status: "Upcoming",
    participants: 0,
    endDate: "2024-05-01",
    image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
  },
  {
    id: 3,
    title: "Party Committee",
    description: "Selection of members for the event planning committee",
    status: "Completed",
    participants: 89,
    endDate: "2024-03-20",
    image: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg",
  },
];

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredElections, setFilteredElections] = useState(elections);
  const [logout] = useMutation(LOGOUT_USER);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const results = searchItems<Election>({
      query: searchTerm,
      items: elections,
      keys: ["title", "description", "status", "endDate"],
      exactMatch: false,
    });

    setFilteredElections(results);
  }, [searchTerm]);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const res = await logout();
      const success = res?.data?.logoutUser?.details;

      if (success) {
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

          {/* Liste des élections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredElections.map((election) => (
              <Card key={election.id} className="group hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-0">
                  <div
                    className="h-48 w-full bg-cover bg-center rounded-t-lg"
                    style={{ backgroundImage: `url(${election.image})` }}
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${election.status === "Ongoing" ? "bg-green-100 text-green-800 animate-pulse" :
                        election.status === "Upcoming" ? "bg-blue-100 text-blue-800 animate-pulse" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                        {election.status}
                      </span>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{election.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{election.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {election.participants} participants
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Voir détails
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
       {/* footer */}
       <Footer/>
      </div >

    </>);
}