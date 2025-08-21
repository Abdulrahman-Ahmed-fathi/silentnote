import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageForm } from '@/components/MessageForm';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, User, Sparkles, Heart, Shield, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { trackProfileView } from '@/lib/profileViews';

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  // Track profile view when profile is loaded
  useEffect(() => {
    if (profile) {
      trackProfileView(profile.id);
    }
  }, [profile]);

  const fetchProfile = async () => {
    if (!username) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true);
        }
        throw error;
      }

      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      if (!notFound) {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in px-4">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-500 border-r-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-sm sm:text-base text-muted-foreground animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md animate-fade-in-up px-4">
          <div className="relative">
            <User className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground mx-auto animate-bounce" />
            <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full animate-ping" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">Profile not found</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            The user @{username} doesn't exist or has deactivated their profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm animate-fade-in">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity animate-slide-in-left">
              <div className="relative">
                <img src="/logo.svg" alt="Tell Me Logo" className="h-6 w-6" />
              </div>
              <span className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient">
                Tell Me
              </span>
            </Link>

            {/* Login/Signup Buttons */}
            <div className="flex items-center gap-2 animate-slide-in-right">
              <Button variant="ghost" size="sm" asChild className="hover:scale-105 transition-transform duration-200">
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="default" size="sm" asChild className="hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        {/* Profile Header */}
        <Card className="p-6 sm:p-8 mb-6 sm:mb-8 text-center bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in-up group hover:scale-105 border-0" style={{ animationDelay: '0.2s' }}>
          <div className="relative mb-4 sm:mb-6">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-xl sm:text-2xl bg-gradient-to-r from-primary to-purple-500 text-primary-foreground">
                {profile.display_name?.[0]?.toUpperCase() || profile.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">@{profile.username}</p>
          
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary rounded-full text-xs sm:text-sm border border-primary/20 hover:scale-105 transition-transform duration-200">
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />
            Send me an anonymous message
          </div>
        </Card>

        {/* Message Form */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <MessageForm 
            receiverId={profile.user_id} 
            receiverUsername={profile.display_name || profile.username}
          />
        </div>

        {/* Enhanced Info Section */}
        <Card className="p-4 sm:p-6 mt-6 sm:mt-8 bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover:scale-110 transition-transform duration-200" />
            <h3 className="text-sm sm:text-base font-semibold text-primary">How it works</h3>
          </div>
          <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
            <li className="flex items-center gap-2 group/item hover:text-primary transition-colors duration-200">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full group-hover/item:scale-150 transition-transform duration-200" />
              Your message will be completely anonymous
            </li>
            <li className="flex items-center gap-2 group/item hover:text-primary transition-colors duration-200">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full group-hover/item:scale-150 transition-transform duration-200" />
              The recipient won't know who sent it
            </li>
            <li className="flex items-center gap-2 group/item hover:text-primary transition-colors duration-200">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full group-hover/item:scale-150 transition-transform duration-200" />
              Be respectful and kind in your messages
            </li>
            <li className="flex items-center gap-2 group/item hover:text-primary transition-colors duration-200">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full group-hover/item:scale-150 transition-transform duration-200" />
              Inappropriate content will be removed
            </li>
          </ul>
        </Card>

        {/* Additional Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <Card className="p-3 sm:p-4 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-md hover:shadow-lg transition-all duration-300 group hover:scale-105">
            <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-200" />
            <h4 className="text-xs sm:text-sm font-medium text-green-700 mb-1">Instant Delivery</h4>
            <p className="text-xs text-green-600">Messages sent immediately</p>
          </Card>
          
          <Card className="p-3 sm:p-4 text-center bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-md hover:shadow-lg transition-all duration-300 group hover:scale-105">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-200" />
            <h4 className="text-xs sm:text-sm font-medium text-purple-700 mb-1">Safe & Secure</h4>
            <p className="text-xs text-purple-600">End-to-end protection</p>
          </Card>
        </div>
      </div>
    </div>
  );
}