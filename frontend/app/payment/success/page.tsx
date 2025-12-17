'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const type = searchParams.get('type');
  const postId = searchParams.get('post_id');
  const creatorId = searchParams.get('creator_id');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const confirmPayment = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Confirm payment with backend
        await api.post('/payment/confirm', {
          sessionId,
          type,
          post_id: postId,
          creator_id: creatorId,
        });

        setLoading(false);
        
        // Redirect after a moment
        setTimeout(() => {
          router.push('/feed');
        }, 2000);
      } catch (err: any) {
        console.error('Payment confirmation error:', err);
        setError(err.response?.data?.error || 'Failed to confirm payment');
        setLoading(false);
      }
    };

    if (user) {
      confirmPayment();
    }
  }, [user, type, postId, creatorId, sessionId, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Processing your payment...</p>
            ) : error ? (
              <>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => router.push('/feed')} className="w-full">
                  Go to Feed
                </Button>
              </>
            ) : (
              <>
                <p className="mb-4 text-green-600">
                  {type === 'ppv' 
                    ? 'Your PPV content has been unlocked!'
                    : 'You have successfully subscribed!'}
                </p>
                <Button onClick={() => router.push('/feed')} className="w-full">
                  Go to Feed
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

