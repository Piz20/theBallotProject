'use client';

import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation'; // Use the `next/navigation` for app directory (Next.js 13)
import { useEffect, useState } from 'react'; 

import { LOGOUT_USER } from "@/lib/mutations/userMutations";

export default function Home() {
  const [logout, { loading, error, data }] = useMutation(LOGOUT_USER);
  const [isClient, setIsClient] = useState(false); // Client-side detection state
  const [isMounted, setIsMounted] = useState(false); // Used to ensure router is accessible

  const router = useRouter();

  useEffect(() => {
    setIsClient(true); // Set the component as mounted after the initial render
    setIsMounted(true); // Once mounted, this ensures we can use `useRouter`
  }, []);

  const handleLogout = async () => {
    try {
      const res = await logout();
      console.log('Logout successful:', res.data.logoutUser.details);

      // Only redirect to /auth if the component has been mounted on the client
      if (res.data.logoutUser.details && isMounted) {
        router.push('/auth'); // Navigate after the mutation is successful
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (!isClient) {
    // Do not render the component until the component is mounted on the client-side
    return null;
  }

  return (
    <div
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Start prompting.</h1>

      <button
        onClick={handleLogout}
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          fontWeight: 'bold',
          color: 'white',
          background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseOver={(e) => {
          (e.currentTarget.style.transform = 'scale(1.05)');
          (e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.3)');
        }}
        onMouseOut={(e) => {
          (e.currentTarget.style.transform = 'scale(1)');
          (e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.25)');
        }}
      >
        {loading ? 'Déconnexion...' : '🚪 Se déconnecter'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>❌ Erreur: {error.message}</p>}
      {data?.logout?.message && (
        <p style={{ color: 'green', marginTop: '1rem' }}>{data.logout.message}</p>
      )}
    </div>
  );
}
