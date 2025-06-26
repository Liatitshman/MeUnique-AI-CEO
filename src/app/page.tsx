'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has completed onboarding
    const preferences = localStorage.getItem('userPreferences');

    if (preferences) {
      // User has preferences, go to mall
      router.push('/mall');
    } else {
      // New user, go to onboarding
      router.push('/onboarding');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">MeUnique AI CEO</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
} 