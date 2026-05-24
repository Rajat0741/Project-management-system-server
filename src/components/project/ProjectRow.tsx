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
      className="group flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-muted/80"
      onClick={() => navigate({ to: `/project/${project._id}` })}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{project.name}</p>
        <p className="meta-text mt-0.5 truncate">{project.description || "No description provided"}</p>
      </div>

      <div className="hidden shrink-0 items-center gap-3 sm:flex">
        <span className="meta-text capitalize">{role}</span>
        <span className="meta-text">-</span>
        <span className="meta-text flex items-center gap-1">
          <Users className="size-3" />
          {project.members}
        </span>
        <span className="meta-text">-</span>
        <span className="meta-text flex items-center gap-1">
          <Calendar className="size-3" />
          {formattedDate}
        </span>
      </div>

      <ChevronRight className="hidden size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
    </motion.div>
  );
}
