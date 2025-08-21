import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  const { signUp, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Password strength validation
  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /\d/.test(password) },
  ];

  // Check for existing session and auto-redirect if user is already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      // Wait for auth to finish loading
      if (authLoading) return;
      
      if (user) {
        // User is already logged in, check if they're admin and redirect accordingly
        try {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error checking admin status:', error);
          }

          const isAdmin = data?.role === 'admin';
          
          toast({
            title: "Welcome back!",
            description: "You're already logged in.",
          });
          
          navigate(isAdmin ? '/admin' : '/dashboard');
        } catch (error) {
          console.error('Error checking admin status:', error);
          navigate('/dashboard');
        }
      } else {
        // No existing session, show signup form
        setIsCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [user, authLoading, navigate, toast]);

  const isPasswordValid = passwordRequirements.every(req => req.met);
  const isUsernameValid = username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      toast({
        variant: "destructive",
        title: "Password requirements not met",
        description: "Please ensure your password meets all requirements.",
      });
      return;
    }

    if (!isUsernameValid) {
      toast({
        variant: "destructive",
        title: "Invalid username",
        description: "Username must be at least 3 characters and contain only letters, numbers, and underscores.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, username);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: error.message || "An error occurred during signup.",
        });
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        navigate('/login');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking for existing session
  if (authLoading || isCheckingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm sm:text-base text-muted-foreground">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 sm:mb-8">
            <img src="/logo.svg" alt="SilentNote Logo" className="h-6 w-6 sm:h-8 sm:w-8" />
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SilentNote
            </h1>
          </Link>
        </div>

        {/* Signup Form */}
        <Card className="p-6 sm:p-8 bg-gradient-card shadow-elegant">
          <div className="space-y-5 sm:space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold">Create your account</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Join our community for anonymous messaging
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm sm:text-base">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="Choose a username"
                  required
                  disabled={isLoading}
                  className="text-sm sm:text-base"
                />
                {username && (
                  <p className={`text-xs ${isUsernameValid ? 'text-green-600' : 'text-red-600'}`}>
                    {isUsernameValid ? '✓' : '✗'} Valid username format
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    required
                    disabled={isLoading}
                    className="text-sm sm:text-base pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {/* Password Requirements */}
                {password && (
                  <div className="space-y-1 p-2 sm:p-3 bg-muted/50 rounded-md">
                    <p className="text-xs font-medium">Password requirements:</p>
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {req.met ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <X className="h-3 w-3 text-red-600" />
                        )}
                        <span className={req.met ? 'text-green-600' : 'text-red-600'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                className="w-full text-sm sm:text-base py-2 sm:py-3" 
                disabled={isLoading || !isPasswordValid || !isUsernameValid}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}