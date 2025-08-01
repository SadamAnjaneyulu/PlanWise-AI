'use client';

import Header from '@/components/header';
import AppSidebar from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <SidebarInset>
            <main className="flex-grow container mx-auto p-4 md:p-8">
              <div className="flex items-center gap-4 mb-8">
                  <Settings className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold">Settings</h1>
              </div>
              
              <div className="max-w-xl mx-auto space-y-8">
                  <Card>
                      <CardHeader>
                          <CardTitle>Profile</CardTitle>
                          <CardDescription>Update your personal information.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="name">Name</Label>
                              <Input id="name" placeholder="Enter your name" />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" type="email" placeholder="Enter your email" />
                          </div>
                           <Button>Update Profile</Button>
                      </CardContent>
                  </Card>

                   <Card>
                      <CardHeader>
                          <CardTitle>Password</CardTitle>
                          <CardDescription>Change your password.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="current-password">Current Password</Label>
                              <Input id="current-password" type="password" />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="new-password">New Password</Label>
                              <Input id="new-password" type="password" />
                          </div>
                           <Button>Change Password</Button>
                      </CardContent>
                  </Card>
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
