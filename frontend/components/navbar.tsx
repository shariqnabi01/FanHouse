'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { User, LogOut, LayoutDashboard, Users, Home } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
              F
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:inline-block">FanHouse</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700 font-medium">{user.email}</span>
                </div>
                
                {user.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </Button>
                  </Link>
                )}
                
                {user.role === 'creator' && (
                  <Link href="/creator">
                    <Button variant="outline" size="sm" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Button>
                  </Link>
                )}
                
                {user.role === 'fan' && (
                  <>
                    <Link href="/feed">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Home className="h-4 w-4" />
                        <span className="hidden sm:inline">Feed</span>
                      </Button>
                    </Link>
                    <Link href="/creators">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Creators</span>
                      </Button>
                    </Link>
                  </>
                )}
                
                <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

