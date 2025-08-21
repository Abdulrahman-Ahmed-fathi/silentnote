import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Navigation } from '@/components/Navigation';
import { Settings as SettingsIcon, User, Save, ArrowLeft, Shield, Bell, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ImageUpload } from '@/components/ImageUpload';
import { uploadImage, deleteImage } from '@/lib/uploadUtils';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export default function Settings() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    display_name: ''
  });
  const [emailFormData, setEmailFormData] = useState({
    newEmail: '',
    confirmEmail: '',
    currentPassword: ''
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before checking user state
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchProfile();
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFormData({
        username: data.username || '',
        display_name: data.display_name || ''
      });
      setPreviewUrl(data.avatar_url || null);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Failed to load profile",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    
    setSaving(true);
    try {
      let newAvatarUrl = profile.avatar_url;

      // If a new file was selected, upload it first
      if (selectedFile) {
        const uploadResult = await uploadImage(selectedFile, user.id);
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload image');
        }
        
        newAvatarUrl = uploadResult.url!;
        
        // If there was a previous avatar, delete it from storage
        if (profile.avatar_url) {
          await deleteImage(profile.avatar_url);
        }
      } else if (previewUrl === null && profile.avatar_url) {
        // User wants to remove current avatar
        await deleteImage(profile.avatar_url);
        newAvatarUrl = null;
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          display_name: formData.display_name || null,
          avatar_url: newAvatarUrl || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Reset file state and refresh profile data
      setSelectedFile(null);
      fetchProfile();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailFormChange = (field: string, value: string) => {
    setEmailFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordFormChange = (field: string, value: string) => {
    setPasswordFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailChange = async () => {
    if (emailFormData.newEmail !== emailFormData.confirmEmail) {
      toast({
        variant: "destructive",
        title: "Emails don't match",
        description: "Please make sure both email addresses are identical.",
      });
      return;
    }

    if (emailFormData.newEmail === user?.email) {
      toast({
        variant: "destructive",
        title: "Same email",
        description: "The new email must be different from your current email.",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: emailFormData.newEmail
      });

      if (error) throw error;

      toast({
        title: "Email update initiated",
        description: "Please check your new email for a confirmation link to complete the update.",
      });

      // Reset form
      setEmailFormData({
        newEmail: '',
        confirmEmail: '',
        currentPassword: ''
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update email",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
      });
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordFormData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });

      // Reset form
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update password",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (file: File | null, previewUrl: string | null) => {
    setSelectedFile(file);
    setPreviewUrl(previewUrl);
  };

  // Show loading state while auth is being checked or data is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in px-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm sm:text-base text-muted-foreground">
            {authLoading ? 'Checking authentication...' : 'Loading settings...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Navigation */}
      <Navigation onSignOut={signOut} />

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Update your profile information and manage your account settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <ImageUpload
                currentAvatarUrl={profile.avatar_url}
                onImageChange={handleImageChange}
                userId={user.id}
                disabled={saving}
                displayName={formData.display_name}
                username={formData.username}
              />

              <Separator />

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm sm:text-base">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="text-sm sm:text-base"
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  This will be your unique identifier. Users will find you at /u/{formData.username}
                </p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display_name" className="text-sm sm:text-base">Display Name</Label>
                <Input
                  id="display_name"
                  placeholder="Enter your display name"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  className="text-sm sm:text-base"
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  This is how your name will be displayed to others.
                </p>
              </div>

              {/* Profile URL */}
              {profile && (
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Your Profile URL</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={`${window.location.origin}/u/${formData.username}`}
                      readOnly
                      className="bg-muted text-xs sm:text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/u/${formData.username}`);
                        toast({
                          title: "Link copied!",
                          description: "Your profile link has been copied to clipboard.",
                        });
                      }}
                      className="text-xs sm:text-sm"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={saving} size="sm" className="text-sm sm:text-base">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Section */}
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Account</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Manage your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Change Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Email</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-4 p-3 sm:p-4 border rounded-lg bg-muted/30">
                  <div className="space-y-2">
                    <Label htmlFor="newEmail" className="text-sm sm:text-base">New Email Address</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      placeholder="Enter new email address"
                      value={emailFormData.newEmail}
                      onChange={(e) => handleEmailFormChange('newEmail', e.target.value)}
                      disabled={saving}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmEmail" className="text-sm sm:text-base">Confirm New Email</Label>
                    <Input
                      id="confirmEmail"
                      type="email"
                      placeholder="Confirm new email address"
                      value={emailFormData.confirmEmail}
                      onChange={(e) => handleEmailFormChange('confirmEmail', e.target.value)}
                      disabled={saving}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleEmailChange} 
                    disabled={saving || !emailFormData.newEmail || !emailFormData.confirmEmail}
                    className="w-full text-sm sm:text-base"
                    size="sm"
                  >
                    {saving ? 'Updating...' : 'Update Email'}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Password Change Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Password</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Update your password to keep your account secure
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 p-3 sm:p-4 border rounded-lg bg-muted/30">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm sm:text-base">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={passwordFormData.newPassword}
                      onChange={(e) => handlePasswordFormChange('newPassword', e.target.value)}
                      disabled={saving}
                      className="text-sm sm:text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordFormData.confirmPassword}
                      onChange={(e) => handlePasswordFormChange('confirmPassword', e.target.value)}
                      disabled={saving}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  
                  <Button 
                    onClick={handlePasswordChange} 
                    disabled={saving || !passwordFormData.newPassword || !passwordFormData.confirmPassword}
                    className="w-full text-sm sm:text-base"
                    size="sm"
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}