import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageCircle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MessageFormProps {
  receiverId: string;
  receiverUsername: string;
}

export const MessageForm = ({ receiverId, receiverUsername }: MessageFormProps) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const maxLength = 300;
  const remainingChars = maxLength - message.length;

  const captureSenderMetadata = async () => {
    const metadata: any = {
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen_resolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Fetch real IP address using a public IP service
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      if (response.ok) {
        const data = await response.json();
        metadata.ip_address = data.ip;
      } else {
        // Fallback to alternative IP service
        const fallbackResponse = await fetch('https://api64.ipify.org?format=json');
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          metadata.ip_address = fallbackData.ip;
        } else {
          metadata.ip_address = 'unknown';
        }
      }
    } catch (error) {
      console.warn('Failed to fetch IP address:', error);
      metadata.ip_address = 'unknown';
    }

    return metadata;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Empty message",
        description: "Please write a message before sending.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Capture comprehensive sender metadata
      const senderMetadata = await captureSenderMetadata();
      
      // Prepare message data
      const messageData: any = {
        content: message.trim(),
        receiver_id: receiverId,
        sender_metadata: senderMetadata, // Store all metadata for admin access
      };

      // Add sender info based on authentication status
      if (session?.user) {
        messageData.sender_user_id = session.user.id;
        messageData.sender_type = 'registered_user';
      } else {
        messageData.sender_type = 'anonymous_user';
        // For anonymous users, we don't store sender_user_id
        // But we store comprehensive metadata for admin monitoring
      }

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: `Your anonymous message has been sent to ${receiverUsername}.`,
      });

      setMessage('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message || "An error occurred while sending your message.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6 bg-gradient-card shadow-elegant">
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Send Anonymous Message</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Your message will be completely anonymous
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Send an anonymous message to ${receiverUsername}...`}
              maxLength={maxLength}
              className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base resize-none"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground">
              <span>Your message will be completely anonymous</span>
              <span className={remainingChars < 50 ? 'text-orange-500' : ''}>
                {remainingChars} characters left
              </span>
            </div>
          </div>

          <Button 
            type="submit" 
            variant="hero" 
            className="w-full text-sm sm:text-base py-2 sm:py-3" 
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Anonymous Message
              </>
            )}
          </Button>
        </form>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <Shield className="h-4 w-4 flex-shrink-0" />
          <span>Your identity is completely protected. The recipient will never know who sent this message.</span>
        </div>
      </div>
    </Card>
  );
};