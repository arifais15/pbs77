
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, type User as AuthUser } from 'firebase/auth';
import type { User } from '@/lib/users';

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const proceedToDashboard = async (authUser: AuthUser) => {
    try {
        const res = await fetch('/api/users/by-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: authUser.email }),
        });

        let userFromDb;
        
        if (!res.ok) {
            // User doesn't exist in database, create them
            const createRes = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: authUser.uid,
                    email: authUser.email || '',
                    role: authUser.email === 'admin@example.com' ? 'admin' : 'user',
                    status: 'active'
                }),
            });

            if (!createRes.ok) {
                throw new Error("Failed to create user in database.");
            }

            userFromDb = await createRes.json();
        } else {
            userFromDb = await res.json();
        }
        
        if (userFromDb.status === 'inactive') {
            await auth.signOut();
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Your account is inactive. Please contact an administrator.",
            });
            setIsLoading(false);
            return;
        }
        
        // Ensure the admin user always gets the admin role on the client-side
        const roleToSet = authUser.email === 'admin@example.com' ? 'admin' : userFromDb.role;
        sessionStorage.setItem('userRole', roleToSet);
        sessionStorage.setItem('userEmail', userFromDb.email);

        toast({
            title: "Login Successful",
            description: "Redirecting to your dashboard...",
        });

        router.push('/dashboard');

    } catch (dbError: any) {
        toast({
            variant: "destructive",
            title: "Login Error",
            description: dbError.message || "Could not retrieve user details after authentication.",
        });
        setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please enter both email and password.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await proceedToDashboard(userCredential.user);
    } catch (signInError: any) {
      if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
        // User not found, attempt to create a new one.
        try {
            const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newAuthUser = newUserCredential.user;
            
            const newUserDoc: User = {
                id: newAuthUser.uid,
                email: email,
                role: email === 'admin@example.com' ? 'admin' : 'user',
                status: 'active'
            };
            
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUserDoc),
            });

            if (!res.ok) {
                throw new Error("Failed to create user in database.");
            }
            
            // Now that user is created in Auth and database, proceed to dashboard
            await proceedToDashboard(newAuthUser);

        } catch (signUpError: any) {
            if (signUpError.message?.includes('email-already-in-use')) {
                 toast({
                    variant: "destructive",
                    title: "Login Failed",
                    description: "Invalid credentials. Please check your email and password.",
                });
            } else {
                 toast({
                    variant: "destructive",
                    title: "Sign-Up Failed",
                    description: signUpError.message || "An unexpected error occurred during sign-up.",
                });
            }
            setIsLoading(false);
        }
      } else {
        // Other sign-in errors
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: signInError.message || "An unexpected authentication error occurred.",
        });
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="arif@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <span className="animate-spin h-4 w-4 border-b-2 rounded-full border-primary-foreground"></span>
        ) : (
          <LogIn className="mr-2 h-4 w-4" />
        )}
        Login
      </Button>
    </form>
  );
}
