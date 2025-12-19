'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Navbar } from '@/components/navbar';
import { Loader } from '@/components/loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  email: string;
  username?: string;
  role: string;
  created_at: string;
}

interface Creator {
  id: string;
  user_id: string;
  verification_status: string;
  email?: string;
  username?: string;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  fan_email?: string;
  creator_email?: string;
  created_at: string;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'creators' | 'transactions'>('creators');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [usersRes, creatorsRes, transactionsRes] = await Promise.all([
        api.get<{ users: User[] }>('/admin/users'),
        api.get<{ creators: Creator[] }>('/admin/creators'),
        api.get<{ transactions: Transaction[] }>('/admin/transactions'),
      ]);
      setUsers(usersRes.data.users);
      setCreators(creatorsRes.data.creators);
      setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCreator = async (creatorId: string) => {
    try {
      await api.post(`/admin/creators/${creatorId}/approve`);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to approve');
    }
  };

  const handleRejectCreator = async (creatorId: string) => {
    try {
      await api.post(`/admin/creators/${creatorId}/reject`);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reject');
    }
  };

  const handleDisableCreator = async (creatorId: string) => {
    if (!confirm('Are you sure you want to disable this creator?')) return;
    try {
      await api.post(`/admin/creators/${creatorId}/disable`);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to disable');
    }
  };

  if (authLoading) {
    return <Loader message="Loading admin panel..." />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Loader fullScreen={false} message="Loading admin data..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'creators' ? 'default' : 'outline'}
            onClick={() => setActiveTab('creators')}
          >
            Creators
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
          >
            Users
          </Button>
          <Button
            variant={activeTab === 'transactions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </Button>
        </div>

        {activeTab === 'creators' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Creators</h2>
            {creators.map((creator) => (
              <Card key={creator.id}>
                <CardHeader>
                  <CardTitle>
                    {creator.username || creator.email} - {creator.verification_status}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {creator.verification_status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApproveCreator(creator.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectCreator(creator.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDisableCreator(creator.id)}
                    >
                      Disable
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Users</h2>
            <div className="grid gap-4">
              {users.map((u) => (
                <Card key={u.id}>
                  <CardContent className="pt-6">
                    <p className="font-semibold">{u.email}</p>
                    <p className="text-sm text-gray-500">
                      {u.username} • {u.role} • {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Transactions</h2>
            <div className="grid gap-4">
              {transactions.map((tx) => (
                <Card key={tx.id}>
                  <CardContent className="pt-6">
                    <p className="font-semibold">{tx.transaction_type}</p>
                    <p className="text-sm text-gray-500">
                      ${tx.amount} • {tx.fan_email || 'N/A'} → {tx.creator_email || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

