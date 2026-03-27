"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  currentAvatarPath?: string | null;
  userInitials: string;
  onAvatarChange?: (pathname: string | null) => void;
}

export function AvatarUpload({
  currentAvatarPath,
  userInitials,
  onAvatarChange,
}: AvatarUploadProps) {
  const [avatarPath, setAvatarPath] = useState<string | null>(
    currentAvatarPath ?? null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const avatarSrc = previewUrl
    ? previewUrl
    : avatarPath
      ? `/api/storage/file?pathname=${encodeURIComponent(avatarPath)}`
      : null;

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, GIF, or WebP image.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (2MB max for avatars)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Avatar images must be less than 2MB.",
          variant: "destructive",
        });
        return;
      }

      // Show preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", "avatar");

        const response = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const result = await response.json();
        setAvatarPath(result.pathname);
        onAvatarChange?.(result.pathname);

        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully.",
        });
      } catch (error) {
        // Revert preview on error
        setPreviewUrl(null);
        toast({
          title: "Upload failed",
          description:
            error instanceof Error ? error.message : "Failed to upload avatar",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        // Clean up object URL
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(null);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [onAvatarChange, toast]
  );

  const handleRemoveAvatar = useCallback(async () => {
    if (!avatarPath) return;

    setIsUploading(true);

    try {
      const response = await fetch("/api/storage/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pathname: avatarPath }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Delete failed");
      }

      // Update user's avatar_url to null
      await fetch("/api/storage/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ removeAvatar: true }),
      });

      setAvatarPath(null);
      onAvatarChange?.(null);

      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed.",
      });
    } catch (error) {
      toast({
        title: "Remove failed",
        description:
          error instanceof Error ? error.message : "Failed to remove avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [avatarPath, onAvatarChange, toast]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-24 w-24">
          {avatarSrc ? (
            <AvatarImage src={avatarSrc} alt="Profile avatar" />
          ) : null}
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {userInitials}
          </AvatarFallback>
        </Avatar>

        {/* Upload overlay */}
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
          aria-label="Upload new avatar"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </button>

        {/* Remove button */}
        {avatarPath && !isUploading && (
          <button
            type="button"
            onClick={handleRemoveAvatar}
            className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            aria-label="Remove avatar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Choose avatar image"
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileInput}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              {avatarPath ? "Change Photo" : "Upload Photo"}
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG, GIF, or WebP. Max 2MB.
      </p>
    </div>
  );
}
