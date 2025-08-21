import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  User, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

interface NavigationProps {
  onSignOut?: () => void;
  showStats?: boolean;
  unreadCount?: number;
}

export function Navigation({ onSignOut, showStats = false, unreadCount = 0 }: NavigationProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs = [
      { name: 'Home', path: '/', icon: <Home className="h-4 w-4" /> }
    ];

    if (segments[0] === 'dashboard') {
      breadcrumbs.push({ name: 'Dashboard', path: '/dashboard', icon: <Home className="h-4 w-4" /> });
    } else if (segments[0] === 'u') {
      breadcrumbs.push({ name: 'Profile', path: path, icon: <User className="h-4 w-4" /> });
    } else if (segments[0] === 'settings') {
      breadcrumbs.push({ name: 'Settings', path: '/settings', icon: <Settings className="h-4 w-4" /> });
    } else if (segments[0] === 'admin') {
      breadcrumbs.push({ name: 'Admin', path: '/admin', icon: <Settings className="h-4 w-4" /> });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="relative">
                <img src="/logo.svg" alt="SilentNote Logo" className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient">
                SilentNote
              </h1>
            </Link>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 1 && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="h-4 w-4" />}
                    <Link
                      to={crumb.path}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {crumb.icon}
                      <span>{crumb.name}</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {/* Desktop User Actions */}
            {user && (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </Button>

                <Separator orientation="vertical" className="h-6" />

                <Button variant="ghost" size="sm" onClick={onSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            {user && (
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
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && user && (
          <div className="sm:hidden mt-4 pb-4 border-t pt-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              
              <Separator className="my-2" />
              
              <Button variant="ghost" size="sm" onClick={() => {
                setMobileMenuOpen(false);
                onSignOut?.();
              }} className="justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
