import type { ProjectListItem } from "@/types";
import { Users, Calendar, ChevronRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";

interface ProjectRowProps {
  item: ProjectListItem;
  index: number;
}

export function ProjectRow({ item, index }: ProjectRowProps) {
  const { projects: project, role } = item;
  const navigate = useNavigate();

  const formattedDate = new Date(project.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors rounded-xl hover:bg-muted/80"
      onClick={() => navigate({ to: `/project/${project._id}` })}
    >
      {/* Project info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">{project.name}</p>
        {project.description && (
          <p className="meta-text truncate mt-0.5">{project.description}</p>
        )}
      </div>

      {/* Metadata */}
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <span className="meta-text capitalize">{role}</span>
        <span className="meta-text">·</span>
        <span className="meta-text flex items-center gap-1">
          <Users className="size-3" />
          {project.members}
        </span>
        <span className="meta-text">·</span>
        <span className="meta-text flex items-center gap-1">
          <Calendar className="size-3" />
          {formattedDate}
        </span>
      </div>

      {/* Chevron */}
      <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:block" />
    </motion.div>
  );
}
