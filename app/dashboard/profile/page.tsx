'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Building2, Calendar, Award, Upload, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase/client';

export default function ProfilePage() {
  const { profile } = useUser();
  const { info } = useToast();
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    async function fetchUserEmail() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching user email:', error);
          return;
        }
        if (user?.email) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    }
    fetchUserEmail();
  }, []);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleAvatarUpload = () => {
    // Placeholder for future file upload functionality
    info('Coming Soon', 'Profile picture upload will be available in a future update.');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground">
          View and manage your profile information
        </p>
      </div>

      {/* Profile Header Card */}
      <Card variant="elevated" className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-secondary" />
        <CardContent className="relative pt-0 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-12">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-4 border-white dark:border-slate-950 shadow-xl">
                <span className="text-white font-bold text-4xl">{getInitials(profile.full_name)}</span>
              </div>
              <button
                onClick={handleAvatarUpload}
                className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="text-center text-white">
                  <Upload className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-xs font-medium">Upload Photo</span>
                </div>
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left sm:ml-4 mt-4 sm:mt-0">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {profile.full_name || 'User'}
              </h2>
              <p className="text-muted-foreground mb-3">
                {profile.role || 'Learner'} {profile.department && `• ${profile.department}`}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  <Award className="w-3 h-3" />
                  Level {Math.floor((profile.total_xp || 0) / 200) + 1}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  {(profile.total_xp || 0).toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                <p className="text-sm text-foreground truncate">
                  {userEmail || 'Loading...'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">User ID</p>
                <p className="text-sm text-foreground font-mono truncate">
                  {profile.id.substring(0, 16)}...
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">Joined</p>
                <p className="text-sm text-foreground">
                  {formatDate(profile.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Work Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">Role</p>
                <p className="text-sm text-foreground">
                  {profile.role || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">Department</p>
                <p className="text-sm text-foreground">
                  {profile.department || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">Seniority Level</p>
                <p className="text-sm text-foreground capitalize">
                  {profile.seniority_level || 'Not specified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Preferences */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Learning Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Learning Style</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg">
                <span className="text-sm font-medium capitalize">
                  {profile.learning_style || 'Not set'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Daily Learning Goal</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-lg">
                <span className="text-sm font-medium">
                  {profile.daily_learning_time || 30} minutes
                </span>
              </div>
            </div>

            {profile.interests && profile.interests.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.slice(0, 6).map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-muted text-foreground rounded-lg text-xs capitalize"
                    >
                      {interest}
                    </span>
                  ))}
                  {profile.interests.length > 6 && (
                    <span className="px-3 py-1 bg-muted text-muted-foreground rounded-lg text-xs">
                      +{profile.interests.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Learning Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                <p className="text-2xl font-bold text-foreground">{profile.streak_count} days</p>
              </div>
              <div className="text-4xl">🔥</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total XP Earned</p>
                <p className="text-2xl font-bold text-foreground">{(profile.total_xp || 0).toLocaleString()}</p>
              </div>
              <Sparkles className="w-8 h-8 text-green-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Level</p>
                <p className="text-2xl font-bold text-foreground">Level {Math.floor((profile.total_xp || 0) / 200) + 1}</p>
              </div>
              <Award className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
