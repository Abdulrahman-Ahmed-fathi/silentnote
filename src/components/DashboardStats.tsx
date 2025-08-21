import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Heart, 
  Archive, 
  TrendingUp, 
  Users, 
  Clock,
  Activity
} from 'lucide-react';

interface DashboardStatsProps {
  totalMessages: number;
  favoriteMessages: number;
  archivedMessages: number;
  unreadMessages?: number;
  profileViews?: number;
  lastActivity?: string;
}

export function DashboardStats({
  totalMessages,
  favoriteMessages,
  archivedMessages,
  unreadMessages,
  profileViews = 0,
  lastActivity
}: DashboardStatsProps) {
  const stats = [
    {
      title: 'Total Messages',
      value: totalMessages,
      icon: <MessageCircle className="h-4 w-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Messages received'
    },
    {
      title: 'Favorites',
      value: favoriteMessages,
      icon: <Heart className="h-4 w-4" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      description: 'Liked messages'
    },
    {
      title: 'Archived',
      value: archivedMessages,
      icon: <Archive className="h-4 w-4" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      description: 'Stored messages'
    }
  ];

  const engagement = [
    {
      title: 'Profile Views',
      value: profileViews,
      icon: <Users className="h-4 w-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Profile visits'
    },
    {
      title: 'Last Activity',
      value: lastActivity || 'Never',
      icon: <Clock className="h-4 w-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Recent activity'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {engagement.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-lg font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


    </div>
  );
}
