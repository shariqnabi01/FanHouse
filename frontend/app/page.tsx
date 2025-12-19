'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader } from '@/components/loader';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'creator') {
        router.push('/creator');
      } else {
        router.push('/feed');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loader message="Initializing FanHouse..." />;
  }

  return <Loader message="Redirecting..." />;
}

