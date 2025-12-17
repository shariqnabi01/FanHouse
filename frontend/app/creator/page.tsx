'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Post {
  id: string;
  title?: string;
  content?: string;
  media_url?: string;
  access_type: string;
  ppv_price?: number;
  created_at: string;
}

export default function CreatorPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    access_type: 'public',
    ppv_price: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'creator') {
      router.push('/feed');
      return;
    }
    if (user?.role === 'creator' && user.creator?.verification_status !== 'approved') {
      // Show application status or form
    }
    fetchPosts();
    refreshUser();
  }, [user, authLoading]);

  const fetchPosts = async () => {
    try {
      const response = await api.get<{ posts: Post[] }>('/content', {
        params: { creator_id: user?.creator?.id },
      });
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('access_type', formData.access_type);
      if (formData.access_type === 'ppv' && formData.ppv_price) {
        formDataToSend.append('ppv_price', formData.ppv_price);
      }
      if (file) {
        formDataToSend.append('media', file);
      }

      await api.post('/content', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFormData({ title: '', content: '', access_type: 'public', ppv_price: '' });
      setFile(null);
      setShowCreateForm(false);
      fetchPosts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyCreator = async () => {
    try {
      await api.post('/creator/apply', {
        bio: '',
        display_name: user?.username || '',
      });
      refreshUser();
      alert('Application submitted! Waiting for approval.');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to apply');
    }
  };

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  const verificationStatus = user?.creator?.verification_status;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Creator Dashboard</h1>
          {verificationStatus === 'approved' && (
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? 'Cancel' : 'Create Post'}
            </Button>
          )}
        </div>

        {verificationStatus === 'pending' && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-yellow-600">Your creator application is pending approval.</p>
            </CardContent>
          </Card>
        )}

        {verificationStatus === 'rejected' && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-red-600">Your creator application was rejected.</p>
            </CardContent>
          </Card>
        )}

        {!user?.creator && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="mb-4">Apply to become a creator to start monetizing your content.</p>
              <Button onClick={handleApplyCreator}>Apply as Creator</Button>
            </CardContent>
          </Card>
        )}

        {showCreateForm && verificationStatus === 'approved' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title (optional)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content (optional)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="access_type">Access Type</Label>
                  <select
                    id="access_type"
                    value={formData.access_type}
                    onChange={(e) => setFormData({ ...formData, access_type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="public">Public</option>
                    <option value="subscriber">Subscriber Only</option>
                    <option value="ppv">Pay Per View</option>
                  </select>
                </div>
                {formData.access_type === 'ppv' && (
                  <div className="space-y-2">
                    <Label htmlFor="ppv_price">PPV Price ($)</Label>
                    <Input
                      id="ppv_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.ppv_price}
                      onChange={(e) => setFormData({ ...formData, ppv_price: e.target.value })}
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="media">Media (image or video)</Label>
                  <Input
                    id="media"
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Post'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Your Posts</h2>
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>
                  {post.title || 'Untitled Post'}
                  <span className="ml-2 text-sm text-gray-500">({post.access_type})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {post.media_url && (
                  <div className="mb-4">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${post.media_url}`}
                      alt={post.title || 'Post'}
                      className="w-full rounded-lg max-h-96 object-cover"
                    />
                  </div>
                )}
                {post.content && <p className="text-gray-700">{post.content}</p>}
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 && (
            <p className="text-center text-gray-500">No posts yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

