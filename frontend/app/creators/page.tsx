'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Creator {
  id: string;
  display_name?: string;
  username?: string;
  email?: string;
  verification_status: string;
  bio?: string;
}

interface Subscription {
  id: string;
  creator_id: string;
  status: string;
  expires_at: string;
}

export default function CreatorsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Record<string, Subscription>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    fetchCreators();
    fetchSubscriptions();
  }, [user, authLoading]);

  const fetchCreators = async () => {
    try {
      const response = await api.get<{ creators: Creator[] }>('/creator');
      setCreators(response.data.creators);
    } catch (error) {
      console.error('Failed to fetch creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get<{ subscriptions: Subscription[] }>('/payment/subscriptions');
      const subsMap: Record<string, Subscription> = {};
      response.data.subscriptions.forEach((sub: Subscription) => {
        subsMap[sub.creator_id] = sub;
      });
      setSubscriptions(subsMap);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    }
  };

  const handleSubscribe = async (creatorId: string) => {
    setSubscribing(creatorId);
    try {
      console.log('[Frontend] Subscribing to creator:', creatorId);
      const response = await api.post('/payment/subscribe', {
        creator_id: creatorId,
        amount: 9.99,
      });
      
      console.log('[Frontend] Subscription response:', response.data);
      
      // If Stripe checkout URL is returned, redirect to Stripe
      if (response.data.checkoutUrl) {
        console.log('[Frontend] Redirecting to Stripe:', response.data.checkoutUrl);
        window.location.href = response.data.checkoutUrl;
        return;
      }
      
      // Mock payment - show success
      console.log('[Frontend] Mock payment - subscription created');
      alert('Subscribed successfully!');
      fetchCreators(); // Refresh to show updated state
    } catch (error: any) {
      console.error('[Frontend] Subscription error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to subscribe';
      if (errorMsg === 'Already subscribed') {
        alert('You are already subscribed to this creator!');
        fetchSubscriptions(); // Refresh subscription status
      } else {
        alert(errorMsg);
      }
    } finally {
      setSubscribing(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Discover Creators</h1>
          <p className="text-gray-600">Subscribe to your favorite creators and unlock exclusive content</p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {creators.map((creator) => (
            <Card 
              key={creator.id} 
              className="card-hover overflow-hidden border-0 shadow-lg bg-white"
            >
              <div className="h-32 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 relative">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                  <div className="h-20 w-20 rounded-full bg-white border-4 border-white flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                    {(creator.display_name || creator.username || creator.email)?.charAt(0).toUpperCase() || 'C'}
                  </div>
                </div>
              </div>
              
              <CardHeader className="pt-12 pb-3">
                <CardTitle className="text-center text-lg font-semibold">
                  {creator.display_name || creator.username || creator.email}
                </CardTitle>
                {creator.verification_status === 'approved' && (
                  <div className="flex justify-center mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      ✓ Verified
                    </span>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                {creator.bio && (
                  <p className="text-sm text-gray-600 mb-4 text-center line-clamp-3 min-h-[3.75rem]">
                    {creator.bio}
                  </p>
                )}
                
                {subscriptions[creator.id] ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-green-600">✓</span>
                        <p className="text-sm font-semibold text-green-800">Subscribed</p>
                      </div>
                      <p className="text-xs text-green-600 text-center">
                        Expires: {new Date(subscriptions[creator.id].expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleSubscribe(creator.id)}
                      disabled={subscribing === creator.id}
                      variant="outline"
                      className="w-full border-2 hover:bg-gray-50 font-medium"
                    >
                      {subscribing === creator.id ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span> Renewing...
                        </span>
                      ) : (
                        'Renew Subscription'
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(creator.id)}
                    disabled={subscribing === creator.id}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {subscribing === creator.id ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Subscribing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>⭐</span> Subscribe ($9.99/month)
                      </span>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          
          {creators.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No creators available</h3>
              <p className="text-gray-500">Check back later for new creators</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

