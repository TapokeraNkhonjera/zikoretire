"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Settings, 
  Lightbulb, 
  Bell, 
  Shield,
  Palette,
  Database,
  User,
  Camera,
  Upload,
  Check,
  AlertCircle,
  Moon,
  Sun,
  Monitor
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  // Settings states
  const [inlineNudgesEnabled, setInlineNudgesEnabled] = useState(true);
  const [suggestionCardsEnabled, setSuggestionCardsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Profile states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Load user data and settings on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          setName(data.data.name || '');
          setEmail(data.data.email || '');
          setAvatarUrl(data.data.image || '');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    
    const savedSettings = localStorage.getItem('zikoretire-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setInlineNudgesEnabled(settings.inlineNudgesEnabled ?? true);
      setSuggestionCardsEnabled(settings.suggestionCardsEnabled ?? true);
      setNotificationsEnabled(settings.notificationsEnabled ?? true);
      setTheme(settings.theme === 'dark' ? 'dark' : 'light');
    }
    
    // Apply theme immediately
    const isDarkMode = document.documentElement.classList.contains('dark');
    if (isDarkMode !== (theme === 'dark')) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    loadUserData();
  }, []);

  // Save settings to localStorage whenever they change
  const saveSettings = async () => {
    setLoading(true);
    const settings = {
      inlineNudgesEnabled,
      suggestionCardsEnabled,
      notificationsEnabled,
      theme
    };
    
    localStorage.setItem('zikoretire-settings', JSON.stringify(settings));
    
    // Apply theme immediately with proper synchronization
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    if (theme === 'dark' && !isCurrentlyDark) {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light' && isCurrentlyDark) {
      document.documentElement.classList.remove('dark');
    }
    
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };
  
  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadingAvatar(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAvatarUrl(data.data.avatarUrl);
        
        // Update user profile with new avatar
        const updateResponse = await fetch('/api/user/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'avatar',
            avatarUrl: data.data.avatarUrl
          })
        });
        
        if (updateResponse.ok) {
          toast({
            title: "Avatar updated",
            description: "Your profile picture has been updated successfully.",
          });
        }
      } else {
        toast({
          title: "Upload failed",
          description: data.error || "Failed to upload avatar.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading your avatar.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  // Handle profile update
  const handleProfileUpdate = async () => {
    setUpdatingProfile(true);
    
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'profile',
          name,
          email
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        toast({
          title: "Update failed",
          description: data.error || "Failed to update profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "An error occurred while updating your profile.",
        variant: "destructive",
      });
    } finally {
      setUpdatingProfile(false);
    }
  };
  
  
  const handleSettingChange = (setting: string, value: boolean | string) => {
    switch (setting) {
      case 'inlineNudges':
        setInlineNudgesEnabled(value as boolean);
        break;
      case 'suggestionCards':
        setSuggestionCardsEnabled(value as boolean);
        break;
      case 'notifications':
        setNotificationsEnabled(value as boolean);
        break;
      case 'theme':
        setTheme(value as 'light' | 'dark');
        break;
    }
    saveSettings();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your ZikoRetire experience</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Manage your personal information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarUrl} alt={name} />
                  <AvatarFallback className="text-lg">
                    {name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              <div>
                <p className="font-medium">Profile Picture</p>
                <p className="text-sm text-muted-foreground">
                  Click the camera icon to upload a new avatar
                </p>
                {uploadingAvatar && (
                  <p className="text-sm text-primary mt-1">Uploading...</p>
                )}
              </div>
            </div>
            
            <Separator />
            
            {/* Profile Form */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleProfileUpdate}
                disabled={updatingProfile || !name || !email}
              >
                {updatingProfile ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">
                  Last changed: Never
                </p>
              </div>
              <Link href="/dashboard/change-password">
                <Button variant="outline">
                  Change Password
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        {/* ML Suggestions Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              AI Suggestions
            </CardTitle>
            <CardDescription>
              Control how AI-powered suggestions appear
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="inline-nudges">Inline Pop-up Nudges</Label>
                <p className="text-sm text-muted-foreground">
                  Show suggestions directly on input fields
                </p>
              </div>
              <Switch
                id="inline-nudges"
                checked={inlineNudgesEnabled}
                onCheckedChange={(checked: boolean) => handleSettingChange('inlineNudges', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="suggestion-cards">Suggestion Cards</Label>
                <p className="text-sm text-muted-foreground">
                  Show detailed suggestion cards sidebar
                </p>
              </div>
              <Switch
                id="suggestion-cards"
                checked={suggestionCardsEnabled}
                onCheckedChange={(checked: boolean) => handleSettingChange('suggestionCards', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive retirement planning updates
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={(checked: boolean) => handleSettingChange('notifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Control your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Data Usage</p>
              <p className="text-sm text-muted-foreground">
                Your retirement data is encrypted and stored securely
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Export My Data
            </Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme-toggle">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark theme
                </p>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onCheckedChange={(checked: boolean) => handleSettingChange('theme', checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Manage your retirement planning data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full">
              Backup Data
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Restore Data
            </Button>
            <Button variant="destructive" size="sm" className="w-full">
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Save Status */}
      <div className="flex items-center justify-between pt-6 border-t">
        <p className="text-sm text-muted-foreground">
          Settings are automatically saved to your browser
        </p>
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Saving...</span>
          </div>
        )}
      </div>
    </div>
  );
}
