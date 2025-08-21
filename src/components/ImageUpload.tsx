import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  currentAvatarUrl?: string | null;
  onImageChange: (file: File | null, previewUrl: string | null) => void;
  userId: string;
  disabled?: boolean;
  displayName?: string | null;
  username?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function ImageUpload({ 
  currentAvatarUrl, 
  onImageChange, 
  userId, 
  disabled = false,
  displayName,
  username
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  
  // Update preview URL when currentAvatarUrl changes
  useEffect(() => {
    setPreviewUrl(currentAvatarUrl || null);
  }, [currentAvatarUrl]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select a JPG, PNG, or WebP image file.",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
      });
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    onImageChange(file, url);
  };

  const handleRemoveImage = () => {
    if (previewUrl && previewUrl !== currentAvatarUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(currentAvatarUrl || null);
    setSelectedFile(null);
    onImageChange(null, currentAvatarUrl || null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveCurrentAvatar = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    onImageChange(null, null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = () => {
    return displayName?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || '?';
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
      {/* Avatar Preview */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
          <AvatarImage src={previewUrl || undefined} alt="Profile picture" />
          <AvatarFallback className="text-base sm:text-lg">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {/* Upload Overlay */}
        {!disabled && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={handleUploadClick}
          >
            <Upload className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex-1 space-y-3 sm:space-y-2 min-w-0">
        <label className="text-sm sm:text-base font-medium">Profile Picture</label>
        
        {/* Button Container */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={disabled || isUploading}
            className="text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 h-auto"
          >
            {isUploading ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
            ) : (
              <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            )}
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </Button>

          {previewUrl && previewUrl !== currentAvatarUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
              disabled={disabled}
              className="text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 h-auto"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Remove New
            </Button>
          )}
          
          {currentAvatarUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveCurrentAvatar}
              disabled={disabled}
              className="text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 h-auto"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Remove Current
            </Button>
          )}
        </div>
        
        <p className="text-xs sm:text-sm text-muted-foreground">
          JPG, PNG, or WebP. Max 10MB.
        </p>
      </div>
    </div>
  );
}
