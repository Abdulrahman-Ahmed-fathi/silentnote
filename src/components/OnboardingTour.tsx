import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MessageCircle, 
  User, 
  Settings, 
  Heart, 
  Archive, 
  Search, 
  Shield, 
  Zap,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  highlight?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to SilentNote!',
    description: 'Your secure space for anonymous messaging. Let\'s get you started with a quick tour.',
    icon: <MessageCircle className="h-8 w-8 text-primary" />
  },
  {
    id: 'profile',
    title: 'Your Profile',
    description: 'Customize your profile with a display name, avatar, and bio. Share your unique link to receive messages.',
    icon: <User className="h-8 w-8 text-blue-500" />,
    action: 'Go to Settings',
    highlight: 'profile-section'
  },
  {
    id: 'messages',
    title: 'Managing Messages',
    description: 'Organize your messages with favorites, archives, and search. Keep what matters most.',
    icon: <Heart className="h-8 w-8 text-pink-500" />,
    highlight: 'messages-section'
  },
  {
    id: 'security',
    title: 'Privacy & Security',
    description: 'Your messages are completely anonymous. Senders can\'t see who you are, and we protect your data.',
    icon: <Shield className="h-8 w-8 text-green-500" />
  },
  {
    id: 'ready',
    title: 'You\'re All Set!',
    description: 'Start sharing your profile link and receive anonymous messages. Remember to be kind and respectful.',
    icon: <Zap className="h-8 w-8 text-yellow-500" />
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setProgress(((currentStep + 1) / onboardingSteps.length) * 100);
    }
  }, [currentStep, isOpen]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="relative pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute top-2 right-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center justify-center mb-4">
            {currentStepData.icon}
          </div>
          
          <CardTitle className="text-center text-lg">
            {currentStepData.title}
          </CardTitle>
          
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep + 1} of {onboardingSteps.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground leading-relaxed">
            {currentStepData.description}
          </p>
          
          {currentStepData.action && (
            <div className="text-center">
              <Badge variant="secondary" className="text-xs">
                💡 {currentStepData.action}
              </Badge>
            </div>
          )}
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Skip tour
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

