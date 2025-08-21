import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Users, Zap, Heart, Lock, Menu, X, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ username: string; display_name: string | null } | null>(null);
  const { user, loading: authLoading } = useAuth();

  // Fetch user profile when user is logged in
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('user_id', user.id)
            .single();

          if (!error && data) {
            setUserProfile(data);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 animate-fade-in">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 animate-slide-in-left">
              <div className="relative">
                <img src="/logo.svg" alt="SilentNote Logo" className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient">
                SilentNote
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-3 animate-slide-in-right">
              {user ? (
                <>
                  <Button variant="ghost" asChild className="hover:scale-105 transition-transform duration-200">
                    <Link to="/dashboard">
                      <User className="h-4 w-4 mr-2" />
                      Continue as {userProfile?.display_name || userProfile?.username || 'User'}
                    </Link>
                  </Button>
                  <Button variant="hero" asChild className="hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl">
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="hover:scale-105 transition-transform duration-200">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button variant="hero" asChild className="hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="sm:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 pb-4 border-t pt-4 animate-fade-in">
              <div className="flex flex-col gap-3">
                {user ? (
                  <>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <User className="h-4 w-4 mr-2" />
                        Continue as {userProfile?.display_name || userProfile?.username || 'User'}
                      </Link>
                    </Button>
                    <Button variant="hero" asChild className="justify-start">
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                    </Button>
                    <Button variant="hero" asChild className="justify-start">
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-green-600 bg-green-100 px-2 sm:px-3 py-1 rounded-full">
                End-to-End Secure
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight px-2">
              Send and receive{' '}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient">
                anonymous messages
              </span>{' '}
              safely
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Connect with others through honest, anonymous communication. Share your thoughts, 
              receive feedback, and build meaningful connections without judgment.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            {user ? (
              <>
                <Button size="lg" variant="premium" asChild className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 hover:scale-105 transition-transform duration-200 shadow-xl hover:shadow-2xl">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 hover:scale-105 transition-transform duration-200 border-2">
                  <Link to={`/u/${userProfile?.username || 'demo'}`}>View My Profile</Link>
                </Button>
              </>
            ) : (
              <Button size="lg" variant="premium" asChild className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 hover:scale-105 transition-transform duration-200 shadow-xl hover:shadow-2xl">
                <Link to="/signup">Get Started Free</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 px-4">
            Why choose <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">SilentNote</span>?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Built with privacy, security, and user experience in mind.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4">
          <Card className="p-6 sm:p-8 text-center bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up group hover:scale-105 border-0" style={{ animationDelay: '0.4s' }}>
            <div className="relative mb-4 sm:mb-6">
              <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 group-hover:text-primary transition-colors">100% Anonymous</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Your identity is completely protected. Send and receive messages without revealing who you are.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 text-center bg-gradient-to-br from-white to-blue-50 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up group hover:scale-105 border-0" style={{ animationDelay: '0.6s' }}>
            <div className="relative mb-4 sm:mb-6">
              <Zap className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500 mx-auto group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 group-hover:text-blue-500 transition-colors">Instant Delivery</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Messages are delivered instantly. No delays, no complications - just honest communication.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 text-center bg-gradient-to-br from-white to-purple-50 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up group hover:scale-105 border-0 sm:col-span-2 lg:col-span-1" style={{ animationDelay: '0.8s' }}>
            <div className="relative mb-4 sm:mb-6">
              <Users className="h-12 w-12 sm:h-16 sm:w-16 text-purple-500 mx-auto group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 group-hover:text-purple-500 transition-colors">Safe Community</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Advanced moderation and anti-spam features keep our community safe and respectful.
            </p>
          </Card>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <Card className="p-6 sm:p-8 md:p-12 text-center bg-gradient-to-r from-primary via-purple-500 to-blue-500 text-primary-foreground relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium bg-white/20 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm">
                Join the Community
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 px-4">
              Ready to start your anonymous journey?
            </h2>
            <p className="text-base sm:text-lg md:text-xl opacity-90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join thousands of users who trust SilentNote for honest, secure communication.
            </p>
            <Button size="lg" variant="secondary" asChild className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 hover:scale-105 transition-transform duration-200 shadow-xl hover:shadow-2xl">
              <Link to="/signup">Create Your Profile</Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}