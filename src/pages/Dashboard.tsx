import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCard } from '@/components/MessageCard';
import { Navigation } from '@/components/Navigation';
import { DashboardStats } from '@/components/DashboardStats';
import { OnboardingTour } from '@/components/OnboardingTour';
import { MessageCircle, Search, Heart, Archive, LogOut, User, Copy, ExternalLink, Settings, Menu, X, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getProfileViewsByUser } from '@/lib/profileViews';

interface Message {
  id: string;
  content: string;
  created_at: string;
  is_favorite: boolean;
  is_archived: boolean;
  is_read: boolean;
}

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ username: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [profileViews, setProfileViews] = useState(0);

  // Check onboarding status immediately when component mounts
  useEffect(() => {
    if (user?.id) {
      const onboardingCompleted = localStorage.getItem(`onboarding_completed_${user.id}`);
      if (onboardingCompleted === 'true') {
        setHasCompletedOnboarding(true);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    // Wait for auth to finish loading before checking user state
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchProfile();
    fetchMessages();
    fetchProfileViews();
    
    // Check if user needs onboarding - only show once ever per user
    const onboardingCompleted = localStorage.getItem(`onboarding_completed_${user.id}`);
    if (onboardingCompleted === 'true') {
      setHasCompletedOnboarding(true);
    } else if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [user, authLoading, navigate, hasCompletedOnboarding]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchMessages = async () => {
    if (!user) return;
    
    try {
      // Only fetch message content and status - NO sender information
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          is_favorite,
          is_archived,
          is_read
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load messages",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileViews = async () => {
    if (!user) return;
    
    try {
      const { count, error } = await getProfileViewsByUser(user.id);
      if (error) {
        console.error('Error fetching profile views:', error);
        return;
      }
      setProfileViews(count);
    } catch (error: any) {
      console.error('Error fetching profile views:', error);
    }
  };

  const handleToggleFavorite = async (messageId: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const { error } = await supabase
        .from('messages')
        .update({ is_favorite: !message.is_favorite })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => 
        prev.map(m => 
          m.id === messageId 
            ? { ...m, is_favorite: !m.is_favorite }
            : m
        )
      );

      toast({
        title: message.is_favorite ? "Removed from favorites" : "Added to favorites",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update message",
        description: error.message,
      });
    }
  };

  const handleToggleArchive = async (messageId: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const { error } = await supabase
        .from('messages')
        .update({ is_archived: !message.is_archived })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => 
        prev.map(m => 
          m.id === messageId 
            ? { ...m, is_archived: !m.is_archived }
            : m
        )
      );

      toast({
        title: message.is_archived ? "Message unarchived" : "Message archived",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update message",
        description: error.message,
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(m => m.id !== messageId));
      
      toast({
        title: "Message deleted",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete message",
        description: error.message,
      });
    }
  };

  const copyProfileLink = () => {
    if (!profile) return;
    
    const profileUrl = `${window.location.origin}/u/${profile.username}`;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Link copied!",
      description: "Your profile link has been copied to clipboard.",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setHasCompletedOnboarding(true);
    if (user?.id) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
  };

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeMessages = filteredMessages.filter(m => !m.is_archived);
  const favoriteMessages = filteredMessages.filter(m => m.is_favorite && !m.is_archived);
  const archivedMessages = filteredMessages.filter(m => m.is_archived);

  // Show loading state while auth is being checked or data is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in px-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm sm:text-base text-muted-foreground">
            {authLoading ? 'Checking authentication...' : 'Loading your messages...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Navigation */}
      <Navigation 
        onSignOut={handleSignOut}
      />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Welcome Section for New Users */}
        {!hasCompletedOnboarding && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Welcome to SilentNote!</h3>
                <p className="text-sm text-blue-700">Let's get you started with a quick tour of your dashboard.</p>
              </div>
              <Button size="sm" onClick={() => setShowOnboarding(true)} className="ml-auto">
                Start Tour
              </Button>
            </div>
          </div>
        )}

        {/* Dashboard Stats */}
        <div className="mb-8">
          <DashboardStats
            totalMessages={messages.length}
            favoriteMessages={messages.filter(m => m.is_favorite).length}
            archivedMessages={messages.filter(m => m.is_archived).length}
            profileViews={profileViews}
            lastActivity={messages.length > 0 ? new Date(messages[0].created_at).toLocaleDateString() : undefined}
          />
        </div>

        {/* Search */}
        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-sm sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Profile Actions */}
        {profile && (
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={copyProfileLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate(`/u/${profile.username}`)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        )}

        {/* Message Tabs */}
        <Tabs defaultValue="all" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="all" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              All ({activeMessages.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
              Favorites ({favoriteMessages.length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
              Archived ({archivedMessages.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 sm:space-y-4">
            {activeMessages.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No messages yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground px-4">
                  Share your profile link to start receiving anonymous messages!
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {activeMessages.map((message) => (
                  <MessageCard
                    key={message.id}
                    id={message.id}
                    content={message.content}
                    createdAt={message.created_at}
                    isFavorite={message.is_favorite}
                    isArchived={message.is_archived}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleArchive={handleToggleArchive}
                    onDelete={handleDeleteMessage}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-3 sm:space-y-4">
            {favoriteMessages.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No favorite messages</h3>
                <p className="text-sm sm:text-base text-muted-foreground px-4">
                  Messages you mark as favorites will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {favoriteMessages.map((message) => (
                  <MessageCard
                    key={message.id}
                    id={message.id}
                    content={message.content}
                    createdAt={message.created_at}
                    isFavorite={message.is_favorite}
                    isArchived={message.is_archived}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleArchive={handleToggleArchive}
                    onDelete={handleDeleteMessage}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="space-y-3 sm:space-y-4">
            {archivedMessages.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Archive className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No archived messages</h3>
                <p className="text-sm sm:text-base text-muted-foreground px-4">
                  Messages you archive will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {archivedMessages.map((message) => (
                  <MessageCard
                    key={message.id}
                    id={message.id}
                    content={message.content}
                    createdAt={message.created_at}
                    isFavorite={message.is_favorite}
                    isArchived={message.is_archived}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleArchive={handleToggleArchive}
                    onDelete={handleDeleteMessage}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}