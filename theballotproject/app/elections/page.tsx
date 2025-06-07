"use client";

// React and Next.js core functionalities.
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// UI components used for building the page structure and elements.
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LazyImage from "@/components/ui/lazy-image";
import ElectionSkeleton from "@/components/ui/election-skeleton";

// Icons for visual elements within the UI.
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
  ChevronLeft,
} from "lucide-react";

// GraphQL related imports for data fetching and mutations.
import { useMutation, useQuery } from "@apollo/client";
import { LOGOUT_USER } from "@/lib/mutations/userMutations";
import { GET_ALL_ELECTIONS } from "@/lib/mutations/electionMutations";
// Custom hooks and state management stores.
import { useToastStore } from "@/hooks/useToastStore";

// UI notification components.
import { Toaster } from "@/components/ui/toaster";

// TypeScript interfaces for defining data structures.
import { Election } from "@/interfaces/interfaces";

// A collection of placeholder image URLs for elections.
const RANDOM_IMAGES = [
  "https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg",
  "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
  "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg",
  "https://images.pexels.com/photos/1509582/pexels-photo-1509582.jpeg",
  "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
  "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
];

const now = new Date();

const mapElectionData = (apiData: any[]): Election[] => {
  return apiData.map((item) => {
    console.log(item.imageFile, item.status);
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      startDate: item.startDate,
      endDate: item.endDate,
      createdAt: item.createdAt,
      status:
        item.status,
      imageUrl: item.imageUrl,
      imageFile: item.imageFile,
      eligibleVoters: item.eligibleVoters || 0
    };
  });
};

// Defines the ElectionPage component, responsible for displaying, filtering, and paginating elections, and handling user logout.
export default function ElectionPage() {
  // Fetches election data using Apollo Client.
  const { loading, error, data } = useQuery(GET_ALL_ELECTIONS);

  // Manages component state: all elections, search term, filtered/displayed elections, pagination, and loading states.
  const [elections, setElections] = useState<Election[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredElections, setFilteredElections] = useState<Election[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false); // General loading state, e.g., for logout.

  // Initializes logout mutation, router, and toast notifications.
  const [logout] = useMutation(LOGOUT_USER);
  const router = useRouter();
  const { addToast } = useToastStore();

  // Configuration for pagination.
  const ITEMS_PER_PAGE = 6; // Number of items to display per page.
  const totalPages = Math.ceil(filteredElections.length / ITEMS_PER_PAGE);




  // Processes fetched election data.
  useEffect(() => {
    if (!loading && data && data.allElections) {
      const mapped = mapElectionData(data.allElections);
      setElections(mapped);
      setFilteredElections(mapped);
      setCurrentPage(1);
    }
  }, [data, loading]);

  // Filters elections based on search term.
  useEffect(() => {
    const filtered = searchTerm
      ? elections.filter(election =>
        election.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (election.description ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        election.status?.toLowerCase().includes(searchTerm.toLowerCase())

      )
      : elections;

    setFilteredElections(filtered);
    setCurrentPage(1);
  }, [searchTerm, elections]);

  // Get current elections to display
  const getCurrentElections = () => {
    const indexOfLastElection = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstElection = indexOfLastElection - ITEMS_PER_PAGE;
    return filteredElections.slice(indexOfFirstElection, indexOfLastElection);
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages]);
  // Pagination controls
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });

    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });

    }
  };

  // Handles user logout.
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

  function truncateText(text: string, maxLength: number) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  }


  // Returns the JSX for rendering the Election Page UI.
  return (
    <>
      {/* Page title, typically for the browser tab. */}
      <title>TheBallotProject - Elections</title>

      {/* Main container for the entire page with a gradient background. */}
      <div className="min-h-screen bg-gradient-to-br from-background to-background/90">
        {/* Navigation bar section. */}
        <nav className="bg-gray-100 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo and main navigation links. */}
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
              {/* User actions and mobile menu button. */}
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
                {/* Mobile menu toggle */}
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content area of the page. */}
        <div className="container mx-auto px-4 py-8">
          {/* Page header with title and "Create Election" button. */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Elections</h1>
            <Button asChild>
              <Link href="/elections/create">
                <Plus className="mr-2 h-5 w-5" />
                Create an election {/* Create an election */}
              </Link>
            </Button>
          </div>

          {/* Statistics cards section (Active Elections, Total Participants, Participation Rate). */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card for Active Elections */}
            <Card className="bg-primary/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Élections actives {/* Active Elections */}
                </CardTitle>
                <Vote className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  +2 ce mois {/* +2 this month */}
                </p>
              </CardContent>
            </Card>
            {/* Card for Total Participants */}
            <Card className="bg-primary/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Participants totaux {/* Total Participants */}
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">234</div>
                <p className="text-xs text-muted-foreground">
                  +18% vs mois dernier {/* +18% vs last month */}
                </p>
              </CardContent>
            </Card>
            {/* Card for Participation Rate */}
            <Card className="bg-primary/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Taux de participation {/* Participation Rate */}
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">
                  +12% vs dernière élection {/* +12% vs last election */}
                </p>
              </CardContent>
            </Card>
          </div>
          {/* Toaster component for displaying notifications. */}
          <Toaster />
          {/* Search bar for filtering elections. */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for an election (name, date, description...)..." // Search for an election (name, date, description...)
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Conditional rendering for the list of elections: loading skeleton, no results message, or the election cards. */}
          {loading ? (
            // Display skeleton loaders while data is being fetched.
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 elections-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <ElectionSkeleton key={index} />
              ))}
            </div>
          ) : filteredElections.length === 0 ? (
            // Display message if no elections are found.
            <div className="text-center py-10">
              <p className="text-gray-500">No elections found. Try a different search term.</p>
            </div>
          ) : (
            // Display the list of elections with pagination controls.
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 elections-grid">
                {getCurrentElections().map((election) => (
                  // Individual election card.
                  <div
                    key={election.id}
                    className="group hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-fadeIn"
                  >
                    <div className="relative">
                      <LazyImage
                        src={
                          election.imageUrl
                          || (election.imageFile ? `http://localhost:8000/media/${election.imageFile}` : null)
                          || "https://via.placeholder.com/150"
                        }
                        alt={election.name || "Election image"}

                      />
                      {/* Icône engrenage */}
                      <Link
                        href={`/elections/${election.id}/settings`}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/70 p-1 rounded-full shadow hover:bg-white"
                      >
                        <Settings className="w-5 h-5 text-gray-600 hover:text-primary" />
                      </Link>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`inline-block text-sm font-semibold px-2 py-0.5 rounded-full
    ${election.status === 'active'
                              ? 'bg-green-100 text-green-800 animate-pulse'
                              : election.status === 'upcoming'
                                ? 'bg-blue-100 text-blue-800 animate-pulse'
                                : election.status === 'draft' || !election.status
                                  ? 'bg-orange-100 text-orange-800'
                                  : election.status === 'completed'
                                    ? 'bg-gray-900 text-gray-100'
                                    : 'bg-gray-100 text-gray-800'
                            }
  `}
                        >
                          {election.status ?? 'draft'}
                        </span>


                        <Calendar className="h-4 w-4 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{truncateText(election.name ?? "",35)}</h3>
                      <p className="text-sm text-gray-600 mb-4">{truncateText(election.description ?? "", 100)}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">
                            {Array.isArray(election.eligibleEmails) ? election.eligibleEmails.length : 0} eligible voters
                          </span>
                        </div>
                        <button className="text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                          View details
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Start: {new Date(election.startDate ?? "").toLocaleDateString()}</span>
                          <span>End: {new Date(election.endDate ?? "").toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {filteredElections.length > 0 && (
                <div className="flex justify-between items-center mt-8 py-4">
                  <Button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="flex items-center gap-1 transition-all duration-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="text-sm">
                    Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
                  </div>

                  <Button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="flex items-center gap-1 transition-all duration-300"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        {/* Footer section of the page. */}
        <Footer />
      </div>
    </>
  );
}