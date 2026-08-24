import { useState } from "react";
import { MoreHorizontal, UserPlus, Shield, UserMinus } from "lucide-react";
import type { ProjectMemberWithDetails } from "@/types";
import { useMakeProjectMemberAdmin, useRemoveProjectMember } from "@/hooks/useProjects";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AssignTaskDialog } from "./AssignTaskDialog";

interface MemberActionsProps {
  member: ProjectMemberWithDetails;
  projectId: string;
  isCurrentUserAdmin: boolean;
}

export function MemberActions({ member, projectId, isCurrentUserAdmin }: MemberActionsProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showMakeAdminDialog, setShowMakeAdminDialog] = useState(false);
  const [showAssignTaskDialog, setShowAssignTaskDialog] = useState(false);

  // Only show actions if current user is admin
  if (!isCurrentUserAdmin) return null;

  return (
    <>
      <ActionsMenu
        member={member}
        onAssignTask={() => setShowAssignTaskDialog(true)}
        onRemoveMember={() => setShowRemoveDialog(true)}
        onMakeAdmin={() => setShowMakeAdminDialog(true)}
      />

      <RemoveMemberDialog
        member={member}
        projectId={projectId}
        isOpen={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
      />

      <MakeAdminDialog
        member={member}
        projectId={projectId}
        isOpen={showMakeAdminDialog}
        onClose={() => setShowMakeAdminDialog(false)}
      />

      <AssignTaskDialog
        isOpen={showAssignTaskDialog}
        onClose={() => setShowAssignTaskDialog(false)}
        projectId={projectId}
        assignToMember={member}
      />
    </>
  );
}

interface ActionsMenuProps {
  member: ProjectMemberWithDetails;
  onAssignTask: () => void;
  onRemoveMember: () => void;
  onMakeAdmin: () => void;
}

function ActionsMenu({ member, onAssignTask, onRemoveMember, onMakeAdmin }: ActionsMenuProps) {
  const isAdmin = member.role === "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}>
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onAssignTask}>
          <UserPlus className="mr-2 h-4 w-4" />
          Assign Task
        </DropdownMenuItem>

        {!isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onMakeAdmin}>
              <Shield className="mr-2 h-4 w-4" />
              Make Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRemoveMember} className="text-destructive focus:text-destructive">
              <UserMinus className="mr-2 h-4 w-4" />
              Remove Member
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface RemoveMemberDialogProps {
  member: ProjectMemberWithDetails;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

function RemoveMemberDialog({ member, projectId, isOpen, onClose }: RemoveMemberDialogProps) {
  const removeMember = useRemoveProjectMember(projectId);

  const handleRemoveMember = () => {
    removeMember.mutate(member.user._id, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{member.user.fullName || member.user.username}</strong> from this
            project? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemoveMember}
            disabled={removeMember.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {removeMember.isPending ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface MakeAdminDialogProps {
  member: ProjectMemberWithDetails;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

function MakeAdminDialog({ member, projectId, isOpen, onClose }: MakeAdminDialogProps) {
  const makeAdmin = useMakeProjectMemberAdmin(projectId);

  const handleMakeAdmin = () => {
    makeAdmin.mutate(member.user._id, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Make Admin</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to promote <strong>{member.user.fullName || member.user.username}</strong> to admin?
            They will have full access to manage the project settings and members.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleMakeAdmin} disabled={makeAdmin.isPending}>
            {makeAdmin.isPending ? "Promoting..." : "Make Admin"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
