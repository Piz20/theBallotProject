// page.tsx

"use client"; // Marquer ce fichier comme composant client

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importer depuis 'next/navigation' au lieu de 'next/router'

const HomePageRedirect: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/home.html'); // Rediriger vers le fichier public
  }, [router]);

  return null; // Pas de rendu nécessaire, juste une redirection
};

export default HomePageRedirect;
