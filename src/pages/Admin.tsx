import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/Navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Shield, 
  Search, 
  Trash2, 
  User, 
  Globe, 
  Calendar,
  MessageCircle,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface AdminMessage {
  id: string;
  content: string;
  created_at: string;
  receiver_username: string;
  sender_username: string | null;
  sender_type: 'registered_user' | 'anonymous_user';
  sender_metadata: {
    timestamp: string;
    user_agent: string;
    language: string;
    platform: string;
    screen_resolution: string;
    timezone: string;
    ip_address: string;
  } | null;
  is_read: boolean;
  is_archived: boolean;
}

export default function Admin() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before checking user state
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    checkAdminStatus();
  }, [user, authLoading, navigate]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      // Check if user has admin role
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.role === 'admin') {
        setIsAdmin(true);
        fetchMessages();
      } else {
        toast({
          variant: "destructive",
          title: "Access denied",
          description: "You don't have admin privileges.",
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error checking admin status:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      // First, fetch all messages with comprehensive sender information
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_metadata,
          sender_type,
          is_read,
          is_archived,
          receiver_id,
          sender_user_id
        `)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        return;
      }

      // Get unique user IDs from messages
      const userIds = new Set<string>();
      messagesData.forEach(msg => {
        if (msg.receiver_id) userIds.add(msg.receiver_id);
        if (msg.sender_user_id) userIds.add(msg.sender_user_id);
      });

      // Fetch profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', Array.from(userIds));

      if (profilesError) throw profilesError;

      // Create a map of user_id to username
      const usernameMap = new Map<string, string>();
      profilesData?.forEach(profile => {
        usernameMap.set(profile.user_id, profile.username);
      });

      // Transform the data to match our interface
      const transformedMessages = messagesData.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        receiver_username: usernameMap.get(msg.receiver_id) || 'Unknown',
        sender_username: msg.sender_user_id ? usernameMap.get(msg.sender_user_id) || 'Unknown' : null,
        sender_type: msg.sender_type || 'anonymous_user',
        sender_metadata: msg.sender_metadata || null,
        is_read: msg.is_read,
        is_archived: msg.is_archived,
      }));

      setMessages(transformedMessages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        variant: "destructive",
        title: "Failed to load messages",
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
        description: "The message has been permanently removed.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete message",
        description: error.message,
      });
    }
  };

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.receiver_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (message.sender_username && message.sender_username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Show loading state while auth is being checked or data is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in px-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm sm:text-base text-muted-foreground">
            {authLoading ? 'Checking authentication...' : 'Checking admin access...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Navigation */}
      <Navigation onSignOut={signOut} />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6 bg-gradient-card shadow-card">
            <div className="flex items-center gap-2 sm:gap-3">
              <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Messages</p>
                <p className="text-lg sm:text-2xl font-bold">{messages.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 bg-gradient-card shadow-card">
            <div className="flex items-center gap-2 sm:gap-3">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">From Users</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {messages.filter(m => m.sender_username).length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 bg-gradient-card shadow-card">
            <div className="flex items-center gap-2 sm:gap-3">
              <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Anonymous</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {messages.filter(m => !m.sender_username).length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 bg-gradient-card shadow-card">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Today</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {messages.filter(m => 
                    new Date(m.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages, usernames..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
            <Button variant="outline" className="sm:w-auto text-sm sm:text-base" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </Card>

        {/* Messages Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Message Content</TableHead>
                  <TableHead className="text-xs sm:text-sm">Receiver</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Sender Info</TableHead>
                  <TableHead className="text-xs sm:text-sm">Timestamp</TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="max-w-[150px] sm:max-w-xs">
                      <p className="truncate text-xs sm:text-sm">{message.content}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">@{message.receiver_username}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {message.sender_username ? (
                        <div className="space-y-1">
                          <Badge variant="secondary" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            @{message.sender_username}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Registered User
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Anonymous
                          </Badge>
                          {message.sender_metadata && (
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p className="truncate max-w-[200px]">
                                {message.sender_metadata.user_agent}
                              </p>
                              <p className="text-xs">
                                {message.sender_metadata.ip_address && `IP: ${message.sender_metadata.ip_address}`}
                                {message.sender_metadata.language && ` | Lang: ${message.sender_metadata.language}`}
                                {message.sender_metadata.platform && ` | Platform: ${message.sender_metadata.platform}`}
                              </p>
                              <p className="text-xs">
                                {message.sender_metadata.screen_resolution && `Screen: ${message.sender_metadata.screen_resolution}`}
                                {message.sender_metadata.timezone && ` | TZ: ${message.sender_metadata.timezone}`}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs sm:text-sm">
                        <p>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</p>
                        <p className="text-xs text-muted-foreground hidden sm:block">
                          {new Date(message.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-destructive hover:text-destructive p-1 sm:p-2"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredMessages.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No messages found</h3>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'No messages have been sent yet.'}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}