'use client';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is null (initial state), we might want to wait or check localStorage
    // But here we assume AuthContext handles initial load quickly
    const storedUser = localStorage.getItem('user');
    if (!user && !storedUser) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null; // Or a loading spinner
  }

  return children;
};

export default ProtectedRoute;
