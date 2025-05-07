"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Données simulées pour les élections
const elections = [
  {
    id: 1,
    title: "Élection du Bureau Exécutif 2024",
    description: "Élection annuelle pour le renouvellement du bureau exécutif",
    status: "En cours",
    participants: 145,
    endDate: "2024-04-15",
    image: "https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg"
  },
  {
    id: 2,
    title: "Représentants des Étudiants",
    description: "Élection des représentants étudiants pour l'année académique",
    status: "À venir",
    participants: 0,
    endDate: "2024-05-01",
    image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
  },
  {
    id: 3,
    title: "Comité des Fêtes",
    description: "Sélection des membres du comité des fêtes",
    status: "Terminé",
    participants: 89,
    endDate: "2024-03-20",
    image: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg"
  }
];

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredElections, setFilteredElections] = useState(elections);

  useEffect(() => {
    const results = elections.filter(election =>
      Object.values(election).some(value =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredElections(results);
  }, [searchTerm]);

  return (
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
                <Link href="/dashboard" className="text-gray-700 hover:text-primary">
                  Tableau de bord
                </Link>
                <Link href="/dashboard/statistics" className="text-gray-700 hover:text-primary">
                  <LineChart className="h-4 w-4 inline-block mr-1" />
                  Statistiques
                </Link>
                <Link href="/dashboard/profile" className="text-gray-700 hover:text-primary">
                  <User className="h-4 w-4 inline-block mr-1" />
                  Profil
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive">
                <LogOut className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <Button asChild>
            <Link href="/dashboard/create">
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${election.status === "En cours" ? "bg-green-100 text-green-800 animate-pulse" :
                        election.status === "À venir" ? "bg-blue-100 text-blue-800 animate-pulse" :
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

      {/* Footer */}
      <footer className="bg-black text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Vote className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">TheBallotProject</span>
              </div>
              <p className="text-sm text-gray-400">
                Simplifiez vos processus électoraux avec notre plateforme innovante.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-400 hover:text-primary">Fonctionnalités</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary">Tarifs</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-400 hover:text-primary">À propos</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary">Carrières</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-400 hover:text-primary">Confidentialité</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary">CGU</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 LaForge – TheBallotProject. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}