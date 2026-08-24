import { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUpdateProfilePicture } from "@/hooks/useAuth";

interface ProfileAvatarProps {
  avatarUrl?: string;
  fullName: string;
  username: string;
}

export function ProfileAvatar({ avatarUrl, fullName, username }: ProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateProfilePicture = useUpdateProfilePicture();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) return;

      const formData = new FormData();
      formData.append("avatar", file);
      updateProfilePicture.mutate(formData);
    }
    e.target.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="size-28 ring-4 ring-primary/10">
          <AvatarImage src={avatarUrl} alt={fullName || username} />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {getInitials(fullName || username)}
          </AvatarFallback>
        </Avatar>

        {/* Hover overlay */}
        <button
          onClick={handleAvatarClick}
          disabled={updateProfilePicture.isPending}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:cursor-not-allowed"
          title="Change profile picture"
        >
          {updateProfilePicture.isPending ? (
            <Loader2 className="size-6 text-white animate-spin" />
          ) : (
            <>
              <Camera className="size-6 text-white" />
              <span className="text-xs text-white mt-1">Change</span>
            </>
          )}
        </button>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">{fullName || username}</h2>
        <p className="text-sm text-muted-foreground">@{username}</p>
      </div>
    </div>
  );
}
