import { useQuery } from "@tanstack/react-query";
import type { ProjectMemberWithDetails } from "@/types";
import { projectMembersFetchingQueryOptions } from "@/hooks/useProjects";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberActions } from "./MemberActions";
import { useUserStore } from "@/store/userData";

interface MembersListProps {
  members: ProjectMemberWithDetails[] | undefined;
  projectId: string;
  isCurrentUserAdmin: boolean;
}

interface MemberListItemProps {
  member: ProjectMemberWithDetails;
  projectId: string;
  isCurrentUserAdmin: boolean;
}

export function ProjectMembers({ projectId }: ProjectMembersProps) {
  const { data: members, isLoading } = useQuery(projectMembersFetchingQueryOptions(projectId));
  const currentUser = useUserStore((state) => state.userData);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Sort members by role (admins first)
  const sortedMembers = members?.sort((a, b) => {
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (a.role !== "admin" && b.role === "admin") return 1;
    return 0;
  });

  // Check if current user is admin
  const isCurrentUserAdmin = sortedMembers?.some(
    (member) => member.user._id === currentUser?._id && member.role === "admin",
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>Manage who has access to this project.</CardDescription>
      </CardHeader>
      <CardContent>
        <MembersList members={sortedMembers} projectId={projectId} isCurrentUserAdmin={isCurrentUserAdmin ?? false} />
      </CardContent>
    </Card>
  );
}

function MembersList({ members, projectId, isCurrentUserAdmin }: MembersListProps) {
  return (
    <div className="space-y-1">
      {members?.map((member) => (
        <MemberListItem
          key={member.user._id}
          member={member}
          projectId={projectId}
          isCurrentUserAdmin={isCurrentUserAdmin}
        />
      ))}

      {members && members.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No members found.</div>
      )}
    </div>
  );
}

function MemberListItem({ member, projectId, isCurrentUserAdmin }: MemberListItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-9 w-9 border">
          <AvatarImage src={member.user.avatar?.url} alt={member.user.username} />
        </Avatar>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{member.user.fullName}</span>
            {member.role === "admin" && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                Admin
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <span className="truncate">@{member.user.username}</span>
            <span className="shrink-0">•</span>
            <span className="truncate">{member.user.email}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-2">
        <span className="text-xs text-muted-foreground hidden md:block">
          Joined {format(new Date(member.createdAt), "MMM d, yyyy")}
        </span>
        <MemberActions member={member} projectId={projectId} isCurrentUserAdmin={isCurrentUserAdmin} />
      </div>
    </div>
  );
}

// Component for displaying project members
interface ProjectMembersProps {
  projectId: string;
}
