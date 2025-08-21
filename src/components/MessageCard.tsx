import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Archive, Trash2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageCardProps {
  id: string;
  content: string;
  createdAt: string;
  isFavorite: boolean;
  isArchived: boolean;
  onToggleFavorite: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export const MessageCard = ({
  id,
  content,
  createdAt,
  isFavorite,
  isArchived,
  onToggleFavorite,
  onToggleArchive,
  onDelete,
}: MessageCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    onDelete(id);
  };

  return (
    <Card className="p-4 sm:p-6 bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300 animate-fade-in">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="flex-1 pr-2 sm:pr-4">
          <p className="text-sm sm:text-base text-foreground leading-relaxed break-words">{content}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="opacity-60 hover:opacity-100 flex-shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onToggleFavorite(id)} className="text-sm">
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleArchive(id)} className="text-sm">
              <Archive className="h-4 w-4 mr-2" />
              {isArchived ? 'Unarchive' : 'Archive'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive text-sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
        <span className="break-words">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {isFavorite && <Heart className="h-3 w-3 sm:h-4 sm:w-4 fill-red-500 text-red-500" />}
          {isArchived && <Archive className="h-3 w-3 sm:h-4 sm:w-4" />}
        </div>
      </div>
    </Card>
  );
};