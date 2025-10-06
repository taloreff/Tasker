'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CheckCircle,
  Zap,
  Users,
  BarChart3,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    setMounted(true);

    const token = Cookies.get('access_token');
    if (token) {
      router.push('/dashboard');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  if (!mounted || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <nav className="relative z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-semibold">Tasker</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Log in
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-white text-black hover:bg-gray-200">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-medium leading-tight mb-8">
              Tasker is a purpose-built tool for{' '}
              <span className="block">planning and building products</span>
            </h1>

            <p className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
              Meet the system for modern software development.
            </p>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Streamline issues, projects, and product roadmaps.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 px-8"
                >
                  Start building
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative mt-20">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-1">
              <div className="bg-black rounded-lg p-6">
                <div className="grid grid-cols-12 gap-4 h-96">
                  <div className="col-span-3 bg-gray-900 rounded p-4 space-y-3">
                    <div className="flex items-center space-x-2 mb-6">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Tasker</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-300 bg-gray-800 rounded px-2 py-1">
                        <BarChart3 className="w-4 h-4" />
                        <span>Dashboard</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-400 px-2 py-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>My Tasks</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-400 px-2 py-1">
                        <Users className="w-4 h-4" />
                        <span>Teams</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-9 bg-gray-800 rounded p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">
                          Refactor sonic crawler
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-600 text-xs px-2 py-1 rounded">
                            Engineering
                          </span>
                          <span className="text-sm text-gray-400">ENG-135</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-700 rounded"></div>
                        <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section id="features" className="py-32 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-medium mb-6">
                Built for modern teams
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Tasker adapts to your team&apos;s workflow, not the other way
                around.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium mb-4">Lightning Fast</h3>
                <p className="text-gray-400">
                  Built for speed. Navigate through tasks and projects with
                  keyboard shortcuts and instant search.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium mb-4">Team Collaboration</h3>
                <p className="text-gray-400">
                  Real-time collaboration with your team. Share workspaces,
                  assign tasks, and track progress together.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium mb-4">Secure & Reliable</h3>
                <p className="text-gray-400">
                  Enterprise-grade security with 99.9% uptime. Your data is safe
                  and always accessible.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 border-t border-gray-800">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-4xl md:text-5xl font-medium mb-8">
              Ready to build better products?
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Join thousands of teams using Tasker to ship faster and stay
              organized.
            </p>
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 px-12 py-4 text-lg"
              >
                Get started for free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2024 Tasker. Built for modern teams.</p>
        </div>
      </footer>
    </div>
  );
}
