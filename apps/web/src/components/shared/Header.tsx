import { Link } from "@tanstack/react-router";
import DarkModeButton from "./DarkModeButton";
import { HeaderUserAvatar } from "./HeaderUserAvatar";
import { useUserStore } from "@/store/userData";
import { ClipboardCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Header() {
  const { isAuthenticated, userData } = useUserStore();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-gray-50 text-gray-900 dark:text-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
      {/* Left section - Logo or Indicator */}
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg shadow-sm">
            <ClipboardCheck className="size-5" />
          </div>
          <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">Tasky</span>
        </Link>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {!isAuthenticated && <DarkModeButton />}
        {isAuthenticated && (
          userData
            ? <HeaderUserAvatar user={{ name: userData.fullName, email: userData.email, avatar: userData.avatar?.url ?? "" }} />
            : <Skeleton className="size-9 rounded-full" />
        )}
      </div>
    </header>
  );
}
