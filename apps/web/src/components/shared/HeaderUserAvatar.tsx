import { useRef } from "react";
import { LayoutDashboard, LogOut, Sun, Moon, Camera, Loader2, User, ChevronsUpDown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout, useUpdateProfilePicture } from "@/hooks/useAuth";
import { useThemeToggle } from "@/hooks/useTheme";
import { router } from "@/router";
import { Button } from "../ui/button";

interface HeaderUserAvatarProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function HeaderUserAvatar({ user }: HeaderUserAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDark, toggleTheme } = useThemeToggle();
  const logoutMutation = useLogout();
  const updateProfilePicture = useUpdateProfilePicture();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navigateToProjects = () => {
    router.navigate({ to: "/dashboard" });
  };

  const navigateToProfile = () => {
    router.navigate({ to: "/profile" });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      const formData = new FormData();
      formData.append("avatar", file);
      updateProfilePicture.mutate(formData);
    }
    // Reset input to allow selecting the same file again
    e.target.value = "";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative h-10 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm w-auto gap-2 px-3 rounded-full hover:bg-white dark:hover:bg-zinc-800 flex items-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-gray-200 dark:border-zinc-700 shadow-sm">
        <Avatar size="sm">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start text-left text-sm leading-tight">
          <span className="truncate font-medium max-w-30 text-gray-900 dark:text-gray-100">{user.name}</span>
          <span className="truncate text-xs text-gray-500 dark:text-gray-400 max-w-30">{user.email}</span>
        </div>
        <ChevronsUpDown className="ml-auto size-4 text-gray-400 dark:text-gray-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 rounded-xl p-2" align="end" sideOffset={8}>
        {/* User Profile Card */}
        <div className="px-2 py-3 text-left">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Avatar size="lg" className="ring-2 ring-primary/10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-base">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              {/* Avatar overlay for changing picture */}
              <Button
                onClick={handleAvatarClick}
                disabled={updateProfilePicture.isPending}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:cursor-not-allowed"
                title="Change profile picture"
              >
                {updateProfilePicture.isPending ? (
                  <Loader2 className="size-4 text-white animate-spin" />
                ) : (
                  <Camera className="size-4 text-white" />
                )}
              </Button>
              <input ref={fileInputRef} placeholder="Avatar" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-sm">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={navigateToProjects} className="rounded-lg cursor-pointer">
            <LayoutDashboard className="mr-2 size-4" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigateToProfile();
            }} 
            className="rounded-lg cursor-pointer"
          >
            <User className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleTheme} className="rounded-lg cursor-pointer">
          {isDark ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
          {isDark ? "Light Mode" : "Dark Mode"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logoutMutation.mutate()}
          className="rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
