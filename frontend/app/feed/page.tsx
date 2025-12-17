'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Post {
  id: string;
  title?: string;
  content?: string;
  media_url?: string;
  media_type?: string;
  access_type: 'public' | 'subscriber' | 'ppv';
  ppv_price?: number;
  creator_username?: string;
  created_at: string;
  _locked?: boolean;
  _lockType?: 'subscriber' | 'ppv';
  creator_id?: string;
}

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'fan') {
      router.push(user.role === 'admin' ? '/admin' : '/creator');
      return;
    }
    fetchPosts();
  }, [user, authLoading]);

  const fetchPosts = async () => {
    try {
      const response = await api.get<{ posts: Post[] }>('/content');
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockPPV = async (postId: string) => {
    try {
      const response = await api.post('/payment/unlock-ppv', { post_id: postId });
      
      // If Stripe checkout URL is returned, redirect to Stripe
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
        return;
      }
      
      // Mock payment - refresh posts
      fetchPosts();
      alert('Content unlocked successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to unlock');
    }
  };

  const handleSubscribe = async (creatorId: string) => {
    try {
      console.log('[Frontend] Subscribing to creator from feed:', creatorId);
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
      
      // Mock payment - refresh posts
      console.log('[Frontend] Mock payment - subscription created');
      fetchPosts();
      alert('Subscribed successfully!');
    } catch (error: any) {
      console.error('[Frontend] Subscription error:', error);
      alert(error.response?.data?.error || 'Failed to subscribe');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 gradient-text">Your Feed</h1>
            <p className="text-gray-600">Discover content from your favorite creators</p>
          </div>
          
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="card-hover overflow-hidden border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl font-semibold pr-4">
                      {post.title || `Post by ${post.creator_username}`}
                    </CardTitle>
                    <div className="flex gap-2 flex-shrink-0">
                      {post.access_type === 'ppv' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                          💎 PPV ${post.ppv_price}
                        </span>
                      )}
                      {post.access_type === 'subscriber' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          ⭐ Subscriber Only
                        </span>
                      )}
                      {post.access_type === 'public' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          🌐 Public
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {post._locked ? (
                    <div className="mb-4 p-8 sm:p-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-center border-2 border-dashed border-gray-300">
                      {post._lockType === 'ppv' ? (
                        <>
                          <div className="text-5xl mb-4">🔒</div>
                          <p className="text-gray-700 font-medium mb-2 text-lg">Premium Content</p>
                          <p className="text-gray-500 mb-6 text-sm">Unlock this exclusive content</p>
                          <Button 
                            onClick={() => handleUnlockPPV(post.id)}
                            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
                          >
                            Unlock for ${post.ppv_price}
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="text-5xl mb-4">⭐</div>
                          <p className="text-gray-700 font-medium mb-2 text-lg">Subscriber Only</p>
                          <p className="text-gray-500 mb-6 text-sm">Subscribe to access this content</p>
                          {post.creator_id ? (
                            <Button 
                              onClick={() => handleSubscribe(post.creator_id!)}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
                            >
                              Subscribe ($9.99/month)
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => router.push('/creators')}
                              variant="outline"
                              className="font-semibold px-6 py-2 rounded-lg"
                            >
                              View Creators
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  ) : post.media_url ? (
                    <div className="mb-4 rounded-xl overflow-hidden shadow-md">
                      {post.media_type?.startsWith('image') ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${post.media_url}`}
                        alt={post.title || 'Post media'}
                        className="w-full h-auto object-cover"
                      />
                    ) : (
                      <video
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${post.media_url}`}
                        controls
                        className="w-full h-auto"
                      />
                      )}
                    </div>
                  ) : null}
                  
                  {post.content && (
                    <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm">
                        {post.creator_username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{post.creator_username}</p>
                        <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {posts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500 mb-6">Check back later for new content from creators</p>
                <Button onClick={() => router.push('/creators')} variant="outline">
                  Browse Creators
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

