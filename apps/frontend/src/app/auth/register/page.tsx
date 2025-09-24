'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  UserPlus,
  Stars,
  Rocket,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword: _, ...registrationData } = data;
      await registerUser(registrationData);
      toast.success('Account created successfully! Welcome to Tasker!');
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        'Failed to create account. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-tr from-emerald-900 via-teal-900 to-cyan-900">
      {/* Animated Background Effects with Different Colors */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-2/3 left-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          >
            <Stars className="w-3 h-3 text-white/30" />
          </div>
        ))}
      </div>

      <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-emerald-600 to-cyan-600 p-4 rounded-full">
                  <Rocket className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent">
              Join the Revolution
            </h2>
            <p className="mt-3 text-lg text-emerald-100">
              Create your Tasker account and boost your productivity
            </p>
          </div>

          <Card className="mt-8 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl animate-fade-in-up animation-delay-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <UserPlus className="w-6 h-6 text-emerald-400 animate-pulse" />
                Create Account
              </CardTitle>
              <CardDescription className="text-emerald-100">
                Start your journey to organized productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium text-white"
                    >
                      First name
                    </Label>
                    <div className="relative group">
                      <Input
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-emerald-400 transition-all duration-300 pl-4 pr-4 py-3 rounded-xl"
                        placeholder="John"
                        {...register('firstName')}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {errors.firstName && (
                      <p className="text-sm text-red-300 animate-shake">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-medium text-white"
                    >
                      Last name
                    </Label>
                    <div className="relative group">
                      <Input
                        id="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-emerald-400 transition-all duration-300 pl-4 pr-4 py-3 rounded-xl"
                        placeholder="Doe"
                        {...register('lastName')}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {errors.lastName && (
                      <p className="text-sm text-red-300 animate-shake">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-white"
                  >
                    Email address
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-emerald-400 transition-all duration-300 pl-4 pr-4 py-3 rounded-xl"
                      placeholder="john@example.com"
                      {...register('email')}
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-300 animate-shake">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-white"
                  >
                    Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-emerald-400 transition-all duration-300 pl-4 pr-12 py-3 rounded-xl"
                      placeholder="Create a secure password"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/60 hover:text-white transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-300 animate-shake">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-white"
                  >
                    Confirm password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-emerald-400 transition-all duration-300 pl-4 pr-12 py-3 rounded-xl"
                      placeholder="Confirm your password"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/60 hover:text-white transition-colors duration-200"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-300 animate-shake">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <CheckCircle className="w-5 h-5x transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <div className="relative">
                  <div className="mb-4 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-white/80">
                      Already have an account?
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 font-medium text-emerald-300 hover:text-emerald-200 transition-colors duration-200 group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Sign in instead
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
