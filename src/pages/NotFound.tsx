import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-6 sm:p-8 text-center max-w-md w-full bg-gradient-card shadow-elegant">
        <div className="space-y-4 sm:space-y-6">
          <div className="text-6xl sm:text-8xl font-bold text-primary mb-4">404</div>
          
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-xl sm:text-2xl font-bold">Page not found</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4">
            <Button asChild variant="hero" className="text-sm sm:text-base">
              <a href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </a>
            </Button>
            <Button asChild variant="outline" className="text-sm sm:text-base">
              <a href="#" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </a>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
