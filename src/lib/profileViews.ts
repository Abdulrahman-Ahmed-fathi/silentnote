import { supabase } from '@/integrations/supabase/client';

export interface ProfileView {
  id: string;
  profile_id: string;
  viewer_ip: string;
  viewer_user_agent: string;
  viewed_at: string;
  referrer?: string;
}

export async function trackProfileView(profileId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get viewer information
    const viewerInfo = {
      ip_address: 'unknown',
      user_agent: navigator.userAgent,
      referrer: document.referrer || undefined,
      timestamp: new Date().toISOString()
    };

    // Try to get IP address
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      if (response.ok) {
        const data = await response.json();
        viewerInfo.ip_address = data.ip;
      }
    } catch (error) {
      console.warn('Failed to fetch IP address:', error);
    }

    // Insert profile view record
    const { error } = await supabase
      .from('profile_views')
      .insert({
        profile_id: profileId,
        viewer_ip: viewerInfo.ip_address,
        viewer_user_agent: viewerInfo.user_agent,
        referrer: viewerInfo.referrer,
        viewed_at: viewerInfo.timestamp
      });

    if (error) {
      console.error('Error tracking profile view:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error tracking profile view:', error);
    return { success: false, error: error.message };
  }
}

export async function getProfileViews(profileId: string): Promise<{ count: number; error?: string }> {
  try {
    const { count, error } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId);

    if (error) {
      console.error('Error getting profile views:', error);
      return { count: 0, error: error.message };
    }

    return { count: count || 0 };
  } catch (error: any) {
    console.error('Error getting profile views:', error);
    return { count: 0, error: error.message };
  }
}

export async function getProfileViewsByUser(userId: string): Promise<{ count: number; error?: string }> {
  try {
    // First get the profile ID for the user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error getting profile:', profileError);
      return { count: 0, error: profileError.message };
    }

    // Then get the view count for that profile
    return await getProfileViews(profile.id);
  } catch (error: any) {
    console.error('Error getting profile views by user:', error);
    return { count: 0, error: error.message };
  }
}
