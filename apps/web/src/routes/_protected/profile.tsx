import { createFileRoute } from "@tanstack/react-router";
import { Mail, User, Calendar, Shield } from "lucide-react";
import { useUserStore } from "@/store/userData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog";

export const Route = createFileRoute("/_protected/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { userData } = useUserStore();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="border-none shadow-lg">
          <CardContent className="pt-8 pb-6">
            <ProfileAvatar avatarUrl={userData.avatar?.url} fullName={userData.fullName} username={userData.username} />
          </CardContent>
        </Card>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="size-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem icon={<User className="size-4" />} label="Full Name" value={userData.fullName || "Not set"} />
            <Separator />
            <InfoItem
              icon={<Mail className="size-4" />}
              label="Email"
              value={userData.email}
              badge={userData.isEmailVerified ? "Verified" : "Not verified"}
              badgeVariant={userData.isEmailVerified ? "success" : "warning"}
            />
            <Separator />
            <InfoItem icon={<User className="size-4" />} label="Username" value={`@${userData.username}`} />
            <Separator />
            <InfoItem
              icon={<Calendar className="size-4" />}
              label="Member Since"
              value={formatDate(userData.createdAt)}
            />
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="size-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordDialog />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Info Item Component
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: string;
  badgeVariant?: "success" | "warning";
}

function InfoItem({ icon, label, value, badge, badgeVariant }: InfoItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-medium">{value}</p>
        </div>
      </div>
      {badge && (
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            badgeVariant === "success"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
          }`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}
