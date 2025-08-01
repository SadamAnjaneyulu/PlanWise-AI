'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckSquare } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    // TODO: Implement Firebase authentication
    const handleLogin = () => {
        console.log('Login logic goes here');
    }

  return (
    <div className="flex h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
            <div className="flex justify-center mb-6">
                <Link href="/" className="flex items-center gap-2 text-foreground">
                    <CheckSquare className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">PlanWise AI</h1>
                </Link>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome Back!</CardTitle>
                    <CardDescription>Enter your credentials to access your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" />
                    </div>
                    <Button className="w-full" onClick={handleLogin}>Login</Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link href="/signup" className="font-medium text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
